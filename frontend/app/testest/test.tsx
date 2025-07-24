type TriggerButtonProps = {
    onTrigger: () => void;
    label: string;
};

export const TriggerButton = ({ onTrigger, label }: TriggerButtonProps) => {
    return (
        <button
            onClick={onTrigger}
            className="text-sm px-3 py-1 bg-blue-600 text-black rounded hover:bg-blue-700"
        >
            {label}
        </button>
    );
};
