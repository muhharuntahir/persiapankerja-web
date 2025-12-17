import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
type Props = {
  material: {
    title: string;
    content: string;
  };
};

export default function MaterialContent({ material }: Props) {
  if (!material?.content) return null;

  return (
    <article
      className="prose prose-sky max-w-full
      prose-h1:text-3xl
      prose-h2:text-2xl
      prose-p:leading-relaxed
      prose-img:rounded-lg
      prose-img:shadow
      prose-a:text-sky-600
      prose-blockquote:border-l-sky-500"
    >
      <h1>{material.title}</h1>

      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {material.content}
      </ReactMarkdown>
    </article>
  );
}
