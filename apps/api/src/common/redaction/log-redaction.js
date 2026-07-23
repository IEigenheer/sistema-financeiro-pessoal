"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactSensitiveValue = redactSensitiveValue;
const REDACTED = '[REDACTED]';
function redactSensitiveValue(value) {
    return value.replace(/(password|token|secret|authorization)\s*[:=]\s*[^,\s]+/gi, `$1=${REDACTED}`);
}
