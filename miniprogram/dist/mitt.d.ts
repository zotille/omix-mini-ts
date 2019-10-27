export default function (): (n: any) => {
    on: (e: any, t: any) => void;
    off: (e: any, t: any) => void;
    emit: (e: any, t: any) => void;
};
