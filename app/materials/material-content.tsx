type Props = {
  material: {
    title: string;
    content: string;
  };
};

export default function MaterialContent({ material }: Props) {
  if (!material?.content) return null;

  return (
    <article className="prose prose-sky max-w-full prose-h1:text-3xl prose-h2:text-2xl prose-p:leading-relaxed">
      <h1>{material.title}</h1>

      {/* markdown / html */}
      <div dangerouslySetInnerHTML={{ __html: material.content }} />
    </article>
  );
}
