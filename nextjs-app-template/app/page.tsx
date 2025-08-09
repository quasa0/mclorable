import Image from "next/image";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Image
        alt="Freestyle Logo"
        src="/placeholder-freestyle-logo.svg"
        width={347}
        height={280}
        className="opacity-10 w-48"
      />
    </div>
  );
}
