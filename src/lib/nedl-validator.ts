import { NedlCategory, NarcoticClass, Role } from "@/generated/prisma";

export type NedlCheckResult = "PASS" | "WARNING" | "FAIL";

export interface DispensingInput {
  nedlCategory?: NedlCategory | null;
  narcoticClass?: NarcoticClass | null;
  conditionsOfUse?: string | null;
  diagnosis?: string;
  specialCondition?: string;
  projectApproval?: string;
  specialistPrescriber?: string;
  treatmentGuidelineFollowed?: boolean;
  narcoticFormNumber?: string;
  prescriberName?: string;
  dispenserRole: Role;
}

export interface ValidationResult {
  result: NedlCheckResult;
  detail: string;
  blockers: string[];
  warnings: string[];
}

export function validateDispensing(input: DispensingInput): ValidationResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  // ตรวจสอบยาควบคุม (วัตถุออกฤทธิ์/ยาเสพติด)
  if (input.narcoticClass) {
    if (input.dispenserRole !== "PHARMACIST") {
      blockers.push("ยาควบคุมสามารถจ่ายได้โดยเภสัชกรเท่านั้น");
    }
    if (!input.prescriberName?.trim()) {
      blockers.push("ต้องระบุชื่อแพทย์ผู้สั่งยาสำหรับยาควบคุม");
    }
    if (!input.narcoticFormNumber?.trim()) {
      blockers.push("ต้องระบุเลขที่แบบฟอร์มรายงาน อย. สำหรับยาควบคุม");
    }
    warnings.push(
      `ยาวัตถุออกฤทธิ์/ยาเสพติด (${narcoticLabel(input.narcoticClass)}) — ต้องบันทึกรายงานส่ง อย.`
    );
  }

  // ตรวจสอบตามบัญชียา NEDL
  switch (input.nedlCategory) {
    case "b":
      // บัญชี ข — ผ่านเลย
      break;

    case "s":
      // บัญชี ง (special) — แนะนำระบุเหตุผล
      warnings.push(
        "บัญชี ง — แนะนำระบุเหตุผลทางคลินิกสำหรับการเลือกใช้ยา"
      );
      break;

    case "ex":
      // บัญชียาเพิ่มเติม — ต้องระบุการวินิจฉัย
      if (!input.diagnosis?.trim()) {
        blockers.push(
          "บัญชียาเพิ่มเติม (ex) — ต้องระบุการวินิจฉัยโรค (Diagnosis)"
        );
      }
      if (input.conditionsOfUse) {
        warnings.push(`เงื่อนไขการใช้ยา: ${input.conditionsOfUse}`);
      }
      break;

    case "R1":
      // บัญชียา ร1 — ต้องระบุโครงการ
      if (!input.projectApproval?.trim()) {
        blockers.push(
          "บัญชียา ร1 — ต้องระบุโครงการที่ได้รับอนุมัติในการใช้ยา"
        );
      }
      break;

    case "R2":
      // บัญชียา ร2 — ต้องระบุแพทย์ผู้เชี่ยวชาญ
      if (!input.specialistPrescriber?.trim()) {
        blockers.push(
          "บัญชียา ร2 — ต้องระบุแพทย์ผู้เชี่ยวชาญที่สั่งยา"
        );
      }
      if (!input.treatmentGuidelineFollowed) {
        blockers.push(
          "บัญชียา ร2 — ต้องยืนยันว่าปฏิบัติตามแนวทางการรักษา"
        );
      }
      break;
  }

  const result: NedlCheckResult =
    blockers.length > 0 ? "FAIL" : warnings.length > 0 ? "WARNING" : "PASS";

  const detail = [
    ...blockers.map((b) => `❌ ${b}`),
    ...warnings.map((w) => `⚠️ ${w}`),
  ].join("\n");

  return { result, detail, blockers, warnings };
}

function narcoticLabel(c: NarcoticClass): string {
  const map: Record<NarcoticClass, string> = {
    PSYCHOTROPIC_2: "วัตถุออกฤทธิ์ประเภท 2",
    PSYCHOTROPIC_3: "วัตถุออกฤทธิ์ประเภท 3",
    PSYCHOTROPIC_4: "วัตถุออกฤทธิ์ประเภท 4",
    NARCOTIC_2: "ยาเสพติดประเภท 2",
    NARCOTIC_3: "ยาเสพติดประเภท 3",
  };
  return map[c];
}

export { narcoticLabel };
