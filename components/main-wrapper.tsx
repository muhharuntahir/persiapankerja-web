type Props = {
  children: React.ReactNode;
};

export const MainWrapper = ({ children }: Props) => {
  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">{children}</div>
  );
};
