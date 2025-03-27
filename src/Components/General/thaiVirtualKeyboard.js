import React, { useRef, useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "./thaiVirtualKeyboard.css"; // We'll create this for custom styling

const ThaiVirtualKeyboard = ({
  input,
  setInput,
  layout,
  setLayout,
  inputRef,
  onClose,
}) => {
  const keyboardRef = useRef(null);
  const keyboardContainerRef = useRef(null);
  const keyboardHeight = 320; // Height of keyboard

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both keyboard and input
      const isClickOutsideKeyboard =
        keyboardContainerRef.current &&
        !keyboardContainerRef.current.contains(event.target);

      const isClickOutsideInput = !event.target.closest("input");

      if (isClickOutsideKeyboard && isClickOutsideInput) {
        onClose();
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Add keyboard visible class
    document.body.classList.add("keyboard-visible");

    // Handle input scrolling
    if (inputRef?.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const inputBottom = inputRect.bottom;
      const inputTop = inputRect.top;

      if (inputBottom > windowHeight - keyboardHeight) {
        const scrollTo = inputTop - (windowHeight - keyboardHeight) / 2;
        window.scrollTo({
          top: scrollTo,
          behavior: "smooth",
        });
      }
    }

    // Cleanup
    return () => {
      document.body.classList.remove("keyboard-visible");
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, inputRef]);

  const thaiLayout = {
    default: [
      "_ ๅ / - ภ ถ ุ ึ ค ต จ ข ช {bksp}",
      "{tab} ๆ ไ ำ พ ะ ั ี ร น ย บ ล ฃ",
      "ฟ ห ก ด เ ้ ่ า ส ว ง {enter}",
      "{shift} ผ ป แ อ ิ ื ท ม ใ ฝ {shift}",
      "ฅ ฉ ฮ ษ ์ ศ ซ . , ผ {space}",
      "{language}",
    ],
    shift: [
      "% + ๑ ๒ ๓ ๔ ู ฿ ๕ ๖ ๗ ๘ ๙ {bksp}",
      '{tab} ๐ " ฎ ฑ ธ ํ ๊ ณ ฯ ญ ฐ , ฅ',
      "ฤ ฆ ฏ โ ฌ ็ ๋ ษ ศ ซ . {enter}",
      "{shift} ( ) ฉ ฮ ฺ ์ ? ฒ ฬ ฦ {shift}",
      "ฃ ฅ ฆ ฐ ? ฎ ฑ ฒ ณ ญ {space}",
      "{language}",
    ],
  };

  const englishLayout = {
    default: [
      "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
      "{tab} q w e r t y u i o p [ ] \\",
      "{caps} a s d f g h j k l ; ' {enter}",
      "{shift} z x c v b n m , . / {shift}",
      "{space} {language}",
    ],
    shift: [
      "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
      "{tab} Q W E R T Y U I O P { } |",
      '{caps} A S D F G H J K L : " {enter}',
      "{shift} Z X C V B N M < > ? {shift}",
      "{space} {language}",
    ],
  };

  const [currentLanguage, setCurrentLanguage] = React.useState("thai");
  const [isShift, setIsShift] = React.useState(false);
  const [isCaps, setIsCaps] = React.useState(false);

  const onKeyPress = (button) => {
    if (button === "{shift}") {
      setIsShift((prev) => !prev);
    } else if (button === "{caps}") {
      setIsCaps((prev) => !prev);
    } else if (button === "{language}") {
      setCurrentLanguage((prev) => (prev === "thai" ? "english" : "thai"));
      setIsShift(false);
      setIsCaps(false);
    } else if (button === "{space}") {
      setInput(input + " ");
    } else if (button === "{tab}") {
      setInput(input + "\t");
    } else if (button === "{enter}") {
      setInput(input + "\n");
    } else if (button === "{bksp}") {
      setInput(input.slice(0, -1));
    } else if (!button.startsWith("{")) {
      setInput(input + button);
      if (isShift && !isCaps) setIsShift(false);
    }
  };

  return (
    <div className="virtual-keyboard-wrapper font-noto">
      <div className="keyboard-scroll-area" />{" "}
      {/* Adds scrollable space above keyboard */}
      <div
        ref={keyboardContainerRef}
        className="virtual-keyboard-container"
        onMouseDown={(e) => e.stopPropagation()} // Prevent click from bubbling
      >
        <Keyboard
          keyboardRef={(r) => (keyboardRef.current = r)}
          layout={currentLanguage === "thai" ? thaiLayout : englishLayout}
          layoutName={isShift || isCaps ? "shift" : "default"}
          onKeyPress={onKeyPress}
          display={{
            "{bksp}": "⌫",
            "{enter}": "⏎",
            "{shift}": "⇧",
            "{caps}": "⇪",
            "{tab}": "⇥",
            "{space}": " ",
            "{language}": currentLanguage === "thai" ? "EN" : "ไทย",
          }}
          buttonTheme={[
            {
              class: "special-key",
              buttons: "{bksp} {enter} {shift} {caps} {tab} {language}",
              fontFamily: "Noto Sans Thai",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default ThaiVirtualKeyboard;
