export const JUDGE_DEMO_USER_ID = "085b033c-b7e1-4c53-a3d8-233c709114b0";
export const JUDGE_DEMO_EMAIL = "hackathon-judge@safepath-demo.invalid";

export function isJudgeDemoUser(user: { id: string; email?: string } | null | undefined) {
  return user?.id === JUDGE_DEMO_USER_ID && user.email === JUDGE_DEMO_EMAIL;
}