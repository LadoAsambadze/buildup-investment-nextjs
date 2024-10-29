// utils/toast-utils.ts
import { useToast } from "@/hooks/use-toast";

export const useCustomToast = () => {
  const { toast } = useToast();

  const showSuccessToast = (title: string, description: string) => {
    toast({
      title,
      description,
      className: "bg-green-500 text-white",
    });
  };

  const showErrorToast = (title: string, description: string) => {
    toast({
      title,
      description,
      className: "bg-red-500 text-white",
    });
  };

  return { showSuccessToast, showErrorToast };
};
