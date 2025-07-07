import HomeClient from "./homeClient";

export const metadata = {
  title: "DrawBoard - Collaborative Drawing & Whiteboard Tool",
  description:
    "Create, collaborate, and share your ideas with DrawBoard. A powerful online whiteboard and drawing tool for teams, students, and creators.",
  keywords:
    "whiteboard, drawing, collaboration, online drawing, digital whiteboard, team collaboration",
  openGraph: {
    title: "DrawBoard - Collaborative Drawing & Whiteboard Tool",
    description:
      "Create, collaborate, and share your ideas with DrawBoard. A powerful online whiteboard and drawing tool.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
