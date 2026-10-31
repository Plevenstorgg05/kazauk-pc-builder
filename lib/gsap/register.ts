"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Single registration point for GSAP plugins (brief 7.2).
 *
 * ES modules are evaluated once per module graph, so importing this file from
 * any client component registers the plugins exactly once. Registering useGSAP
 * is what makes gsap.context() aware of late-created animations, which is how
 * we avoid orphaned ScrollTriggers.
 */
gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };
