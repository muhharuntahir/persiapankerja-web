type Props = {
  title: string;
  description: string;
};

export const TestUnit = ({ title, description }: Props) => {
  return (
    <div className="rounded-lg border p-4">
      <h2 className="font-bold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
