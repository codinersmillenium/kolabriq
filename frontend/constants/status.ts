import { StatusType, ProjectType } from "@/types/project";

export type BadgeVariant = "blue" | "orange" | "grey" | "green";

export const StatusColor: Record<StatusType, BadgeVariant> = {
    new: "blue",
    in_progress: "orange",
    review: "grey",
    done: "green",
};

export const StatusLabel: Record<StatusType, string> = {
    new: "New",
    in_progress: "In Progress",
    review: "Review",
    done: "Done",
};

export const ProjectTypeClass: Record<ProjectType, string> = {
    free: "bg-gray text-white",
    rewarded: "bg-light-orange",
};

export const ProjectTypeLabel: Record<ProjectType, string> = {
    free: "Free",
    rewarded: "Rewarded",
};
