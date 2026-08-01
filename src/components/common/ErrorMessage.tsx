interface Props {
  title?: string;
  message: string;
}

const ErrorMessage = ({ title = "Unable to load data", message }: Props) => {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <h2 className="mb-2 text-lg font-bold text-red-700">{title}</h2>

      <p className="text-red-600">{message}</p>
    </div>
  );
};

export default ErrorMessage;
