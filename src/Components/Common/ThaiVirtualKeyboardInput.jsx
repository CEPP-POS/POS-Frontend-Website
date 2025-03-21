import React, { useState, useRef } from "react";
import ThaiVirtualKeyboard from "../General/thaiVirtualKeyboard";

const ThaiVirtualKeyboardInput = ({
  value,
  onChange,
  placeholder,
  className,
  readOnly = false,
  type = "text",
}) => {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardLayout, setKeyboardLayout] = useState("thai");
  const keyboardContainerRef = useRef(null);
  const inputContainerRef = useRef(null);

  const handleFocus = () => {
    if (!readOnly) {
      setShowKeyboard(true);
    }
  };

  const handleBlur = (e) => {
    if (
      keyboardContainerRef.current &&
      !keyboardContainerRef.current.contains(e.target) &&
      inputContainerRef.current &&
      !inputContainerRef.current.contains(e.target)
    ) {
      setShowKeyboard(false);
    }
  };

  const handleCloseKeyboard = () => {
    setShowKeyboard(false);
  };

  const handleKeyboardInput = (newValue) => {
    onChange(newValue || "");
  };

  React.useEffect(() => {
    document.addEventListener("mousedown", handleBlur);
    return () => {
      document.removeEventListener("mousedown", handleBlur);
    };
  }, []);

  return (
    <div className="relative w-full">
      <input
        ref={inputContainerRef}
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
        readOnly={readOnly}
      />

      {showKeyboard && !readOnly && (
        <div ref={keyboardContainerRef} className="absolute z-50 mt-2">
          <ThaiVirtualKeyboard
            input={value || ""}
            setInput={handleKeyboardInput}
            layout={keyboardLayout}
            setLayout={setKeyboardLayout}
            inputRef={inputContainerRef}
            onClose={handleCloseKeyboard}
          />
        </div>
      )}
    </div>
  );
};

export default ThaiVirtualKeyboardInput;
