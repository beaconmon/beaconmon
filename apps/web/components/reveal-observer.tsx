"use client";

import { useEffect } from "react";

export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    // Add reveal-js class via JS so SSR HTML never ships opacity:0 (prevents CLS)
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("reveal-js");
      io.observe(el);
    });

    return function () {
      io.disconnect();
    };
  }, []);

  return null;
}