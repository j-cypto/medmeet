export default function Logo({ className="" }: { className?: string }) {
  return <img src="/logo.svg" alt="MedMeet" className={"h-8 w-auto " + className} />;
}
