import re

class PromptSanitizer:
    # Common PII patterns (email, credit card, SSN) and SQL/Financial prompt injection patterns
    EMAIL_PATTERN = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
    CARD_PATTERN = re.compile(r'\b(?:\d[ -]*?){13,16}\b')
    SSN_PATTERN = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
    INJECTION_PATTERNS = [
        re.compile(r'ignore\s+previous\s+instructions', re.IGNORECASE),
        re.compile(r'system\s+prompt', re.IGNORECASE),
        re.compile(r'drop\s+table', re.IGNORECASE),
        re.compile(r'select\s+\*\s+from', re.IGNORECASE),
        re.compile(r'override\s+financial\s+balance', re.IGNORECASE),
    ]

    @classmethod
    def sanitize(cls, prompt: str) -> str:
        sanitized = prompt

        # Remove injection patterns
        for pattern in cls.INJECTION_PATTERNS:
            sanitized = pattern.sub('[FILTERED_INJECTION]', sanitized)

        # Mask PII
        sanitized = cls.EMAIL_PATTERN.sub('[REDACTED_EMAIL]', sanitized)
        sanitized = cls.CARD_PATTERN.sub('[REDACTED_CARD]', sanitized)
        sanitized = cls.SSN_PATTERN.sub('[REDACTED_SSN]', sanitized)

        return sanitized.strip()
