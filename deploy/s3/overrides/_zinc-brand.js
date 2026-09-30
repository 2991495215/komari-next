(function () {
  var BRAND = "ZINC VPS";
  var LOGO_SRC = "/_zinc-logo.png?v=20260609d";
  var scheduled = false;

  function disableLink(link) {
    if (!link) return;
    link.removeAttribute("href");
    link.removeAttribute("target");
    link.removeAttribute("rel");
    link.setAttribute("aria-disabled", "true");
    link.style.cursor = "default";
    link.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        event.stopPropagation();
      },
      true
    );
  }

  function replaceText(root, from, to) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.indexOf(from) !== -1) {
        node.nodeValue = node.nodeValue.split(from).join(to);
      }
    }
  }

  function clearLegacyServiceWorker() {
    if (window.__zincClearedLegacySW) return;
    window.__zincClearedLegacySW = true;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        registrations.forEach(function (registration) {
          registration.unregister();
        });
      }).catch(function () {});
    }

    if (window.caches && caches.keys) {
      caches.keys().then(function (keys) {
        keys.forEach(function (key) {
          caches.delete(key);
        });
      }).catch(function () {});
    }
  }

  function setLogo(container) {
    if (!container) return;
    var iconBox =
      container.matches && container.matches(".h-8.w-8")
        ? container
        : container.querySelector(".h-8.w-8");
    if (iconBox) {
      iconBox.innerHTML =
        '<img src="' +
        LOGO_SRC +
        '" alt="' +
        BRAND +
        '" style="width:100%;height:100%;object-fit:contain;display:block;border-radius:8px;">';
      iconBox.setAttribute("aria-label", BRAND);
      iconBox.classList.remove("bg-primary");
      iconBox.classList.add("bg-transparent");
      iconBox.style.overflow = "hidden";
      iconBox.style.borderRadius = "8px";
    }

    var spans = container.querySelectorAll("span");
    if (spans.length > 1) {
      spans[spans.length - 1].textContent = BRAND;
    }
  }

  function patchNav() {
    var nav = document.querySelector("nav");
    if (!nav) return;
    var brandLink = nav.querySelector('a[href="/"], a[aria-disabled="true"]');
    if (brandLink) {
      brandLink.setAttribute("href", "/");
      brandLink.removeAttribute("aria-disabled");
      brandLink.removeAttribute("target");
      brandLink.removeAttribute("rel");
      brandLink.style.pointerEvents = "";
      brandLink.style.cursor = "pointer";
      setLogo(brandLink);
    }
    nav.querySelectorAll(".h-8.w-8").forEach(setLogo);
  }

  function patchFooter() {
    var footer = document.querySelector("footer");
    if (!footer) return;
    var footerBrand = document.querySelector(
      "body > footer > div > div.grid.grid-cols-1.md\\:grid-cols-3.gap-8.items-start > div.flex.flex-col.items-center.md\\:items-start.gap-3"
    );
    if (footerBrand) {
      setLogo(footerBrand);
      replaceText(footerBrand, "Komari Monitor", BRAND);
      replaceText(footerBrand, "Komari-Next", BRAND);
    }

    replaceText(footer, "Komari Monitor", BRAND);
    replaceText(footer, "Komari-Next", BRAND);
    replaceText(footer, "Professional Server Monitoring Solution", "VPS status overview");
    replaceText(
      footer,
      "Real-time server monitoring with modern design and powerful features",
      "Real-time VPS status and uptime overview"
    );

    var poweredTitle = Array.prototype.find.call(
      footer.querySelectorAll("h4"),
      function (heading) {
        return heading.textContent.trim() === "Powered By";
      }
    );
    if (poweredTitle && poweredTitle.parentElement) {
      poweredTitle.parentElement.remove();
    }

    var grid = footer.querySelector(".grid");
    if (grid) {
      grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))";
    }

    footer
      .querySelectorAll('a[href*="github.com"], a[href*="komari"]')
      .forEach(function (link) {
        disableLink(link);
      });
    footer.querySelectorAll(".h-8.w-8").forEach(setLogo);
  }

  function specialTagStyle(text) {
    if (text === "\u6309\u91cf\u4ed8\u8d39") {
      return { color: "#f59e0b", background: "rgba(245,158,11,.16)", border: "rgba(245,158,11,.45)" };
    }
    if (text === "\u221e\u6d41\u91cf" || text === "\u65e0\u9650\u6d41\u91cf") {
      return { color: "#ef4444", background: "rgba(239,68,68,.16)", border: "rgba(239,68,68,.45)" };
    }
    if (/^\d+(?:\.\d+)?Mbps$/.test(text)) {
      return { color: "#2563eb", background: "rgba(37,99,235,.16)", border: "rgba(37,99,235,.45)" };
    }
    return null;
  }

  function paintSpecialTag(node, style) {
    node.style.setProperty("color", style.color, "important");
    node.style.setProperty("-webkit-text-fill-color", style.color, "important");
    node.style.setProperty("font-weight", "800", "important");
    node.style.removeProperty("text-shadow");
  }

  function paintSpecialBadge(node, style) {
    paintSpecialTag(node, style);
    node.style.setProperty("background-color", style.background, "important");
    node.style.setProperty("border-color", style.border, "important");
    node.style.setProperty("border-style", "solid", "important");
  }

  function isBadgeNode(node) {
    if (!node || !node.classList) return false;
    return (
      node.matches("[data-slot='badge'], .inline-flex.items-center.rounded-full.border") ||
      (node.classList.contains("inline-flex") &&
        node.classList.contains("items-center") &&
        (node.classList.contains("rounded") || node.classList.contains("rounded-full") || node.classList.contains("rounded-md")) &&
        (node.classList.contains("px-1.5") || node.classList.contains("px-2") || node.classList.contains("px-2.5")))
    );
  }

  function findBadgeContainer(node, text) {
    var current = node;
    for (var i = 0; current && i < 4; i += 1, current = current.parentElement) {
      if (!current || !current.getBoundingClientRect) continue;
      if (current.matches("tr, tbody, [role='row'], [role='gridcell']")) break;
      if ((current.textContent || "").trim() !== text) continue;
      var rect = current.getBoundingClientRect();
      if (rect.width <= 180 && rect.height <= 44) return current;
    }
    return null;
  }

  function clearInnerBadgeBackgrounds(badge, style) {
    badge.querySelectorAll("label, span, div").forEach(function (child) {
      if (child === badge) return;
      var childText = (child.textContent || "").trim();
      if (!specialTagStyle(childText)) return;
      paintSpecialTag(child, style);
      child.style.setProperty("background", "transparent", "important");
      child.style.setProperty("background-color", "transparent", "important");
      child.style.setProperty("border-color", "transparent", "important");
      child.style.setProperty("box-shadow", "none", "important");
    });
  }

  function patchTagLabelColor() {
    document.querySelectorAll(".inline-flex.items-center label.text-white").forEach(function (label) {
      var badge = label.closest(".inline-flex.items-center");
      if (!badge) return;
      label.style.setProperty("color", "inherit", "important");
      label.style.setProperty("-webkit-text-fill-color", "inherit", "important");
    });
  }

  function patchSpecialTagText() {
    document.querySelectorAll("label, span, div").forEach(function (node) {
      if (node.tagName === "DIV" && !isBadgeNode(node) && node.querySelector("label, span, div")) return;
      var text = (node.textContent || "").trim();
      var style = specialTagStyle(text);
      if (!style) return;
      var badge = isBadgeNode(node)
        ? node
        : node.closest("[data-slot='badge'], .inline-flex.items-center.rounded-full.border") || findBadgeContainer(node.parentElement, text);
      if (badge) {
        paintSpecialBadge(badge, style);
        clearInnerBadgeBackgrounds(badge, style);
        if (badge !== node) {
          paintSpecialTag(node, style);
          node.style.setProperty("background", "transparent", "important");
          node.style.setProperty("background-color", "transparent", "important");
          node.style.setProperty("border-color", "transparent", "important");
          node.style.setProperty("box-shadow", "none", "important");
        }
      } else {
        paintSpecialBadge(node, style);
      }
    });
  }

  function patchAll() {
    scheduled = false;
    clearLegacyServiceWorker();
    document.title = BRAND;
    patchNav();
    patchFooter();
    patchSpecialTagText();
    patchTagLabelColor();
    document
      .querySelectorAll('a[href*="github.com/tonyliuzj/komari-next"], a[href*="github.com/komari-monitor"]')
      .forEach(disableLink);
  }

  function schedulePatch() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(patchAll);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedulePatch, { once: true });
  } else {
    schedulePatch();
  }

  new MutationObserver(schedulePatch).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
