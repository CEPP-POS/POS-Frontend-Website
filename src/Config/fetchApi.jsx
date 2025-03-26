const fetchApi = async (url, method, body) => {
  // Retrieve the values from sessionStorage
  const token = sessionStorage.getItem("token");
  const ownerId = sessionStorage.getItem("owner_id");

  const branchId = sessionStorage.getItem("branch_id");
  const role = sessionStorage.getItem("role");
  const email = sessionStorage.getItem("email");

  // set data in header
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  // Add the Authorization and other custom headers
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (ownerId) {
    headers["owner_id"] = parseInt(ownerId);
  }
  if (branchId) {
    headers["branch_id"] = parseInt(branchId);
  }
  if (role) {
    headers["role"] = role;
  }

  console.log("ROLE:", role);

  const options = {
    method: method,
    headers: headers,
    body: JSON.stringify(body),
  };

  // If the method is a file upload, you might want to handle it differently
  if (method === "POST" && body instanceof FormData) {
    delete options.headers["Content-Type"]; // Let the browser set the content type for FormData
    options.body = body; // Use the FormData directly
  }

  const response = await fetch(url, options);
  return response;
};

export default fetchApi;
