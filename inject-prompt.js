async function pasteToInput() {

  try {
    // Get clipboard content
    const clipboardText = await navigator.clipboard.readText();
    await navigator.clipboard.writeText('');

    // Try different selectors based on the platform
    const editor =
      document.querySelector('div[contenteditable="true"].ProseMirror') ||  // Claude/ChatGPT
      document.querySelector('.ql-editor[contenteditable="true"]');         // Gemini

    if (!editor) {
      throw new Error("No compatible editor found");
    }

    // Handle Gemini's editor differently
    if (editor.classList.contains('ql-editor')) {
      editor.textContent = clipboardText;
      // Trigger Quill's specific events
      editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
      editor.dispatchEvent(new Event('change', { bubbles: true }));
    }
    // Handle Claude/ChatGPT editor
    else {
      // Create a paragraph element with the text
      const p = document.createElement('p');
      p.textContent = clipboardText;

      // Clear any placeholder text
      if (editor.querySelector('p.is-empty')) {
        editor.innerHTML = '';
      }

      // Insert the content
      editor.appendChild(p);

      // Trigger input event to notify editor of changes
      editor.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
      }));

      // Force editor to update
      editor.dispatchEvent(new Event('change', {
        bubbles: true,
        cancelable: true
      }));
    }

  } catch (error) {
    console.error("Paste error:", error);
  }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'pasteText') {
    console.log("Got paste message");
    setTimeout(pasteToInput, 500)
  }
});