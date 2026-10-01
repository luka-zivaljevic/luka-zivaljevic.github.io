// ============================================================
//  CONTENT — this is the only file you need to edit.
// ============================================================
//
//  Two things live here:
//    SITE      your name, school, major, and the hero/about copy
//    projects  the list of projects shown on the page
//
//  main.js renders everything from these. You never need to open it.
//
// ============================================================


const SITE = {
  name:   "Luka Zivaljevic",
  school: "Purdue University",
  major:  "Industrial Engineering",

  // Hero copy.
  tagline: "Building things that make systems work better",

  // Shown under the headline. The first is used once you have projects
  // listed below; the second is used while the list is still empty.
  intro:      "A collection of the projects I've built.",
  introEmpty: "The first projects are in the works. More here soon.",

  // About section. Keep it to a few sentences.
  about: "I study industrial engineering at Purdue. I like pulling systems apart to see how they actually work, and then building the thing that makes them work better. This page is where those projects end up.",

  // Small facts box under the about text. Add or remove rows freely.
  facts: [
    { label: "Studying", value: "Industrial Engineering, Purdue University" },
    { label: "Interested in", value: "Systems, optimization, automation" }
  ],

  // Paste your LinkedIn profile URL to make the link appear in the nav
  // and about section. Leave it as "" and no link is rendered anywhere.
  linkedin: "",

  // Drop a photo at this path and it replaces the monogram placeholder.
  // Nothing else needs to change.
  portrait: "assets/misc/portrait.jpg"
};


// ============================================================
//  PROJECTS
// ============================================================
//
//  To add a project:
//    1. Copy the template below the array, uncomment it, fill it in.
//    2. Put its images/videos in  assets/<id>/
//    3. Reload. That's it.
//
//  Every field except `id` and `name` is optional — a half-finished
//  entry renders fine, so you can add a project before you have photos.
//
// ============================================================

const projects = [

  // ---- TEMPLATE — copy this block, uncomment it, and fill it in. ----
  //
  // {
  //   // Lowercase, dashes, no spaces. Used for the anchor link (#project-<id>)
  //   // and as the assets folder name.
  //   id: "line-balancing-sim",
  //
  //   name: "Assembly Line Balancing Simulator",
  //
  //   // One short line. Shows on the project card.
  //   tagline: "Finding the bottleneck before the line is built",
  //
  //   // The write-up. For multiple paragraphs, separate them with
  //   // </p><p>  exactly like this:
  //   //   "First paragraph.</p><p>Second paragraph."
  //   description: "What you built, why you built it, what was hard, and what you'd do differently. The honest version reads better than the polished one — what went wrong and how you found it is usually the interesting part.",
  //
  //   // Badges shown under the write-up.
  //   skills: ["Discrete-Event Simulation", "Python", "Optimization"],
  //
  //   // Paths relative to assets/. Spaces must be written as %20.
  //   images: ["line-balancing-sim/overview.png"],
  //
  //   // Same idea. Videos play inline, muted, with controls.
  //   videos: [],
  //
  //   // Build progress shots, earliest first. Hidden behind a
  //   // "Show Build Timeline" toggle.
  //   timeline: [
  //     { src: "line-balancing-sim/first-pass.png", label: "First Pass" },
  //     { src: "line-balancing-sim/final.png",      label: "Final" }
  //   ],
  //
  //   // Links out — repo, writeup, CAD, datasheet, anything.
  //   files: [
  //     { name: "Source on GitHub", url: "https://github.com/luka-zivaljevic/..." }
  //   ]
  // },

];
