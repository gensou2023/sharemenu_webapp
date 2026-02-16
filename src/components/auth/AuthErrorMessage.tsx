type Props = { message: string };

export default function AuthErrorMessage({ message }: Props) {
  return (
    <div className="mb-4 p-3 rounded-[8px] bg-red-50 border border-red-200 text-red-600 text-sm">
      {message}
    </div>
  );
}
