const fetchApi = async (url, method = "GET", body = null) => {
  const token = sessionStorage.getItem("token");
  const ownerId = sessionStorage.getItem("owner_id");
  const branchId = sessionStorage.getItem("branch_id");
  const role = sessionStorage.getItem("role");

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (ownerId) headers["owner_id"] = ownerId;
  if (branchId) headers["branch_id"] = branchId;
  if (role) headers["role"] = role;

  const options = {
    method: method,
    headers: headers,
  };

  if (body) {
    if (method === "POST" && body instanceof FormData) {
      delete options.headers["Content-Type"];
      options.body = body;
    } else {
      options.body = JSON.stringify(body);
    }
  }

  try {
    // Step 1: ยิงไปที่ localhost:3000
    console.log(`Step 1: Sending ${method} request to LOCAL API (${url})`);
    const localResponse = await fetch(url, options);

    // จัดการกับกรณี Conflict (409)
    if (localResponse.status === 409) {
      console.log("Conflict detected (409). This is expected in some cases.");
      return localResponse; // รีเทิร์นผลลัพธ์ 409 กลับไปเพื่อให้แอพจัดการได้อย่างถูกต้อง
    }

    // ตรวจสอบว่า localResponse สำเร็จหรือไม่
    if (!localResponse.ok) {
      console.error(
        `Local API request failed with status: ${localResponse.status}`
      );
      throw new Error(
        `Local API request failed with status: ${localResponse.status}`
      );
    }

    // เก็บ clone ของ response เพื่อส่งคืนทันที แต่ยังสามารถดำเนินการต่อในเบื้องหลังได้
    const clonedResponse = localResponse.clone();

    // กรณี GET ไม่ต้องยิงไปที่ main server ถ้า local สำเร็จ
    if (method === "GET") {
      console.log("Local GET request successful, returning data immediately");
      return clonedResponse;
    }

    // กรณี POST, PUT, PATCH, DELETE - ส่งข้อมูลไปยัง main server แบบ non-blocking
    // โดยไม่รอผลลัพธ์ก่อนส่งคืน response
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      console.log(`Will send ${method} request to MAIN SERVER in background`);

      // ทำงานในเบื้องหลังโดยไม่บล็อกการทำงานของฟังก์ชัน
      (async () => {
        try {
          // กรณี POST ต้องทำตามวิธีเดิมของคุณ
          if (method === "POST") {
            const responseData = await localResponse.clone().json();
            console.log("Local API Response Data:", responseData);

            const mainServerOptions = {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                owner_id: sessionStorage.getItem("owner_id"),
                branch_id: sessionStorage.getItem("branch_id"),
                role: sessionStorage.getItem("role"),
              },
              body: JSON.stringify(responseData),
            };

            const urlPath = url.replace("http://localhost:3000", "");
            const mainServerUrl = `http://10.240.67.14:80/api${urlPath}`;

            try {
              console.log(
                `Actually sending POST to main server: ${mainServerUrl}`
              );
              const mainServerResponse = await fetch(
                mainServerUrl,
                mainServerOptions
              );
              console.log(
                "Response received from main server:",
                mainServerResponse
              );

              if (!mainServerResponse.ok) {
                // เก็บข้อมูลการพยายามส่งที่ล้มเหลวไว้สำหรับ retry ภายหลัง
                await notifyMainServerFailure(
                  mainServerUrl,
                  mainServerOptions.method,
                  mainServerResponse.status,
                  responseData,
                  mainServerOptions.headers
                );

                console.log("Stored failed request for later retry");
              }
            } catch (error) {
              console.error(
                "Network Error connecting to main server:",
                error.message
              );

              // เก็บข้อมูลการพยายามส่งที่ล้มเหลวไว้สำหรับ retry ภายหลัง
              await notifyMainServerFailure(
                urlPath.startsWith("http")
                  ? urlPath
                  : `http://10.240.67.14:80/api${urlPath}`,
                "POST",
                502,
                responseData,
                mainServerOptions.headers
              );
            }
          }
          // กรณี PUT, PATCH, DELETE
          else {
            const urlPath = url.replace("http://localhost:3000", "");
            const mainServerUrl = `http://10.240.67.14:80/api${urlPath}`;

            try {
              console.log(
                `Actually sending ${method} to main server: ${mainServerUrl}`
              );
              const mainServerResponse = await fetch(mainServerUrl, options);
              console.log(
                "Response received from main server:",
                mainServerResponse
              );

              if (!mainServerResponse.ok) {
                // ดึงข้อมูล body ที่จะส่งไปยัง offline endpoint
                let bodyData = {};
                if (options.body) {
                  try {
                    bodyData = JSON.parse(options.body);
                  } catch (e) {
                    console.log("Could not parse body as JSON:", e);
                    bodyData = { rawBody: options.body };
                  }
                }

                // เก็บข้อมูลการพยายามส่งที่ล้มเหลวไว้สำหรับ retry ภายหลัง
                await notifyMainServerFailure(
                  mainServerUrl,
                  options.method,
                  mainServerResponse.status,
                  bodyData,
                  options.headers
                );
              }
            } catch (error) {
              console.error(
                "Network Error connecting to main server:",
                error.message
              );

              // ดึงข้อมูล body ที่จะส่งไปยัง offline endpoint
              let bodyData = {};
              if (options.body) {
                try {
                  bodyData = JSON.parse(options.body);
                } catch (e) {
                  console.log("Could not parse body as JSON:", e);
                  bodyData = { rawBody: options.body };
                }
              }

              // เก็บข้อมูลการพยายามส่งที่ล้มเหลวไว้สำหรับ retry ภายหลัง
              await notifyMainServerFailure(
                urlPath.startsWith("http")
                  ? urlPath
                  : `http://10.240.67.14:80/api${urlPath}`,
                method,
                502,
                bodyData,
                options.headers
              );
            }
          }
        } catch (backgroundError) {
          console.error("Background processing error:", backgroundError);
          // ข้อผิดพลาดในเบื้องหลังไม่ควรส่งผลกระทบต่อการทำงานหลัก
        }
      })();

      // ส่งคืน localResponse ทันที ไม่รอการทำงานเบื้องหลัง
      console.log(
        "Returning local response immediately while background task continues"
      );
      return clonedResponse;
    }

    throw new Error(`Unsupported method: ${method}`);
  } catch (error) {
    console.error("Error with API request:", error);
    throw error;
  }
};

const notifyMainServerFailure = async (
  url,
  method,
  statusCode,
  payload,
  headers
) => {
  const errorData = {
    path: url,
    method: method,
    statusCode: statusCode,
    payload: payload,
    headers: headers,
  };

  console.log("Notifying local server about main server failure:", errorData);

  try {
    const response = await fetch("http://localhost:3000/status/offline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(errorData),
    });

    if (!response.ok) {
      console.error(
        "Failed to notify local server about main server failure:",
        response.status
      );
    } else {
      console.log(
        "Successfully notified local server about main server failure"
      );
    }

    return response.ok;
  } catch (error) {
    console.error("Error sending failure notification:", error);
    return false;
  }
};

// เพิ่มฟังก์ชันสำหรับการ retry
const retryFailedRequests = async () => {
  try {
    console.log("Retrying failed requests...");
    const response = await fetch("http://localhost:3000/status/retry", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        owner_id: sessionStorage.getItem("owner_id"),
        branch_id: sessionStorage.getItem("branch_id"),
        role: sessionStorage.getItem("role"),
      },
    });

    if (!response.ok) {
      console.error(`Retry failed with status: ${response.status}`);
      throw new Error(`Retry request failed with status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Retry result:", result);
    return result;
  } catch (error) {
    console.error("Error retrying failed requests:", error);
    throw error;
  }
};

export { fetchApi as default, retryFailedRequests };
