import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { CinematicHeroLoader } from "@/components/cinematic/CinematicHeroLoader";
import { PostCinematicHome } from "@/components/showroom/PostCinematicHome";

export const metadata: Metadata = {
  title: "KAZAUK | Hardware, considered.",
  description:
    "Explore gaming PC cases, components and hardware field notes. Put together your own specification in the unrestricted KAZAUK demonstration builder.",
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main">
        <CinematicHeroLoader />
        {/* All new content begins after the complete, unchanged cinematic component. */}
        <PostCinematicHome />
      </main>
    </>
  );
}
