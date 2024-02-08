import { callToLocalChain } from '@/lib/utils/estimation/calls';

export async function POST(req: Request) {
  try {
    const params = await req.json();
    const { gasUsed, errors } = await callToLocalChain(params);

    return Response.json({ status: 200, data: { gasUsed }, errors });
  } catch (err) {
    return Response.json({ status: 500, errors: ['Failed to execute call'], message: err });
  }
}
