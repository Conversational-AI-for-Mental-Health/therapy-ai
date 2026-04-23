import html
import re

def llm_text_to_telegram_html(text: str) -> str:
    assert isinstance(text, str)
    t = text.strip()
    if not t:
        return "."

    t = html.escape(t)

    def repl_fence(m: re.Match) -> str:
        code = m.group(1)
        return f"<pre><code>{code}</code></pre>"

    t = re.sub(r"```(?:[^\n]*)\n([\s\S]*?)```", repl_fence, t)
    t = re.sub(r"`([^`\n]+)`", r"<code>\1</code>", t)
    t = re.sub(r"(?m)^[ \t]*- ", "• ", t)

    return t
