import { CallToLocalChain, callToLocalChain } from '@/lib/utils/estimation/calls';

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const params = await req.json();
    const { gasUsed, errors } = await callToLocalChain(
      ...(Object.values(params) as Parameters<CallToLocalChain>),
    );

    return Response.json({ status: 200, data: { gasUsed }, errors });
  } catch (err) {
    return Response.json({ status: 500, errors: ['Failed to execute call'], message: err });
  }
}
