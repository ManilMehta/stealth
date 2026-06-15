import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { UploadForm } from "@/components/UploadForm";
import { createClient } from "@/lib/supabase/server";

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">
          Upload your genotype file
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          We compute a Coronary Artery Disease (CAD) polygenic risk score from your
          SNPs. Your file is processed in seconds. This is a non-clinical demo.
        </p>

        <div className="mt-8">
          <UploadForm />
        </div>

        <p className="mt-6 text-xs text-slate-400">
          No file handy? Use one of the demo profiles in the project&apos;s
          <code className="mx-1 rounded bg-slate-100 px-1 py-0.5">fixtures/</code>
          folder (Low, Average, High risk).
        </p>
      </main>
    </>
  );
}
