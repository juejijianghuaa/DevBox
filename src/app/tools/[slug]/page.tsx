import { TOOLS, getToolById } from "@/config/tools";
import { ToolRenderer } from "@/tools/registry";
import { ToolContainer } from "@/components/common/ToolContainer";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export function generateStaticParams() {
  return TOOLS.map((tool) => ({
    slug: tool.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolById(slug);
  if (!tool) {
    return { title: "工具不存在 - DevBox" };
  }
  return {
    title: `${tool.name} - DevBox 纯前端极客工具箱`,
    description: tool.description,
    keywords: tool.keywords,
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolById(slug);
  if (!tool) {
    notFound();
  }

  return (
    <ToolContainer tool={tool}>
      <ToolRenderer slug={tool.id} />
    </ToolContainer>
  );
}
