/* ===== Site settings: edit these ===== */
const SETTINGS = {
  // HubSpot form submission (leave GUIDs empty until you create the forms in HubSpot)
  hubspotPortalId: "246199396",
  guideFormGuid: "",     // HubSpot form GUID for the lead-magnet form
  contactFormGuid: "",   // HubSpot form GUID for the Contact Us form
  guideUrl: "assets/AI-Governance-Guide.pdf"  // the PDF you will supply
};
/* ===================================== */

// mobile menu + footer year
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".menu-btn"), nav = document.querySelector("nav");
  if (btn) btn.addEventListener("click", () => nav.classList.toggle("open"));
  const y = document.getElementById("y"); if (y) y.textContent = new Date().getFullYear();

  // logo / cover image fallbacks if the image files have not been added yet
  document.querySelectorAll("img[data-fallback]").forEach(img => {
    const showFallback = () => {
      img.style.display = "none";
      const fb = document.querySelector(img.dataset.fallback);
      if (fb) fb.style.display = "flex";
    };
    img.addEventListener("error", showFallback);
    if (img.complete && img.naturalWidth === 0) showFallback();
  });

  // show a placeholder if the video file has not been added yet
  document.querySelectorAll(".video-frame").forEach(frame => {
    const v = frame.querySelector("video"), s = v && v.querySelector("source");
    if (s) s.addEventListener("error", () => frame.classList.add("empty"));
  });

  document.querySelectorAll("form[data-hs]").forEach(form => {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const kind = form.dataset.hs; // "guide" or "contact"
      const guid = kind === "guide" ? SETTINGS.guideFormGuid : SETTINGS.contactFormGuid;
      const msg = form.querySelector(".msg");
      const submit = form.querySelector("button[type=submit]");
      const data = Object.fromEntries(new FormData(form).entries());
      const fields = Object.entries(data).map(([name, value]) => ({ name, value }));
      submit.disabled = true;
      msg.className = "msg";
      try {
        if (guid) {
          const r = await fetch(
            `https://api.hsforms.com/submissions/v3/integration/submit/${SETTINGS.hubspotPortalId}/${guid}`,
            { method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fields, context: { pageUri: location.href, pageName: document.title } }) });
          if (!r.ok) throw new Error("HubSpot " + r.status);
        } else {
          console.warn("HubSpot form GUID not set in script.js: submission was not sent to HubSpot.");
        }
        form.reset();
        if (kind === "guide") {
          msg.className = "msg ok";
          msg.innerHTML = `Thank you! <a href="${SETTINGS.guideUrl}" download><b>Click here to download your AI Governance Guide</b></a>.`;
          const a = document.createElement("a"); a.href = SETTINGS.guideUrl; a.download = ""; document.body.appendChild(a); a.click(); a.remove();
        } else {
          msg.className = "msg ok";
          msg.textContent = "Thanks! We received your message and will be in touch shortly.";
        }
      } catch (err) {
        msg.className = "msg err";
        msg.textContent = "Sorry, something went wrong. Please try again or email us directly.";
      } finally { submit.disabled = false; }
    });
  });
});
