import React, { useState } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
// import "./VirtualKeyboard.css"; // Optional custom styles for additional styling.

const VirtualKeyboard = ({ input, setInput }) => {
  const [layout, setLayout] = useState("default");
  const [language, setLanguage] = useState("english");

  const handleKeyPress = (button) => {
    if (button === "{shift}" || button === "{lock}") {
      handleShift();
    } else if (button === "{language}") {
      toggleLanguage();
    } else if (button === "{bksp}") {
      setInput(input.slice(0, -1));
    } else if (button === "{space}") {
      setInput(input + " ");
    } else {
      setInput(input + button);
    }
  };

  const handleShift = () => {
    setLayout(layout === "default" ? "shift" : "default");
  };

  const toggleLanguage = () => {
    setLanguage(language === "english" ? "thai" : "english");
  };

  const keyboardLayouts = {
    english: {
      default: [
        "q w e r t y u i o p",
        "a s d f g h j k l",
        "{shift} z x c v b n m {bksp}",
        "{language} {space}",
      ],
      shift: [
        "Q W E R T Y U I O P",
        "A S D F G H J K L",
        "{shift} Z X C V B N M {bksp}",
        "{language} {space}",
      ],
    },
    thai: {
      default: [
        "ฟ ภ ม ร ธ ย จ ว บ ล",
        "ด ถ ิ ั ส น บ อ",
        "{shift} บ ฤ ี ญ ท ร ื {bksp}",
        "{language} {space}",
      ],
      shift: [
        "ู ื ฝ ั ร แ น ส ร",
        "เ ิ ำ ก ้ ๊",
        "{shift} ะ ์ ๊ ห เ ฤ แ {bksp}",
        "{language} {space}",
      ],
    },
  };

  return (
    <div>
      <Keyboard
        onKeyPress={handleKeyPress}
        layout={keyboardLayouts[language]}
        layoutName={layout}
        display={{
          "{bksp}": "⌫",
          "{shift}": "⇧",
          "{space}": "␣",
          "{lock}": "⇪",
          "{language}": language === "english" ? "ไทย" : "ENG",
        }}
        buttonTheme={[
          {
            class: "function-keys",
            buttons: "{bksp} {shift} {language} {space}",
          },
        ]}
      />
    </div>
  );
};

export default VirtualKeyboard;
