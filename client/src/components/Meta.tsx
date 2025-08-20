import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { metadata } from "@/lib/metadata";

interface MetaProps {
  title?: string;
  description?: string;
}

export default function Meta({ title, description }: MetaProps) {
  const [location] = useLocation();

  // fallback: use static metadata if no dynamic props
  const pageMeta = metadata[location as keyof typeof metadata] || metadata["*"];

  return (
    <Helmet>
      <title>{title || pageMeta.title}</title>
      <meta name="description" content={description || pageMeta.description} />
    </Helmet>
  );
}
