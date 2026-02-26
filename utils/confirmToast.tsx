import toast from "react-hot-toast";

interface ConfirmToastOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const confirmToast = ({
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmToastOptions) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-gray-900 shadow-lg rounded-lg pointer-events-auto flex flex-col ring-1 ring-black ring-opacity-5`}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="shrink-0 pt-0.5">
              <svg
                className="h-6 w-6 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">{title}</p>
              <p className="mt-1 text-sm text-gray-300">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-t border-gray-700">
          <button
            onClick={() => {
              onCancel?.();
              toast.dismiss(t.id);
            }}
            className="w-full border-r border-gray-700 p-3 flex items-center justify-center text-sm font-medium text-gray-300 hover:bg-gray-800 focus:outline-none transition"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              toast.dismiss(t.id);
            }}
            className="w-full p-3 flex items-center justify-center text-sm font-medium text-blue-400 hover:bg-gray-800 focus:outline-none transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: "top-center",
    }
  );
};
