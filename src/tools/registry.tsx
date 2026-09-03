import React from "react";
import JsonFormatter from "./dev/JsonFormatter";
import TimestampConverter from "./daily/TimestampConverter";
import Base64Codec from "./crypto/Base64Codec";
import HashGenerator from "./crypto/HashGenerator";
import PasswordGenerator from "./crypto/PasswordGenerator";
import QrCodeGenerator from "./daily/QrCodeGenerator";
import TextDiff from "./text/TextDiff";
import ColorConverter from "./daily/ColorConverter";
import ScreenCapturePin from "./media/ScreenCapturePin";

export function ToolRenderer({ slug }: { slug: string }) {
  switch (slug) {
    case "json-formatter":
      return <JsonFormatter />;
    case "timestamp-converter":
      return <TimestampConverter />;
    case "base64-codec":
      return <Base64Codec />;
    case "hash-generator":
      return <HashGenerator />;
    case "password-generator":
      return <PasswordGenerator />;
    case "qrcode-generator":
      return <QrCodeGenerator />;
    case "text-diff":
      return <TextDiff />;
    case "color-converter":
      return <ColorConverter />;
    case "screen-capture-pin":
      return <ScreenCapturePin />;
    default:
      return null;
  }
}
