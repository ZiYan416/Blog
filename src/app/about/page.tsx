import { Metadata } from "next";
import AboutContent from "./about-content";

export const metadata: Metadata = {
  title: "About Me",
  description: "荔冰酪 (Lycheeling) — College Student, Developer, Creator.",
};

export default function AboutPage() {
  return <AboutContent />;
}
