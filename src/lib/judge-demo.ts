export const JUDGE_DEMO_USER_ID = "cebdd845-9f29-4a6d-a84c-bb29d1690386";
export const JUDGE_DEMO_EMAIL = "hackathon-judge@safepath-demo.invalid";

export function isJudgeDemoUser(user: { id: string; email?: string } | null | undefined) {
  return user?.id === JUDGE_DEMO_USER_ID && user.email === JUDGE_DEMO_EMAIL;
}