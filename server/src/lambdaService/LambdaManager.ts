import { LambdaResolver, LambdaResolverArgs } from '.';

export class LambdaManager {
    private lambdas: Map<string, LambdaResolver<any>> = new Map();

    public registerLambda<T>(name: string, lambda: LambdaResolver<T>): this {
        this.lambdas.set(name, lambda);
        return this;
    }

    public async invokeLambda<T>(name: string, args: T, ctx: any = {}): Promise<any> {
        if (this.lambdas.has(name)) {
            const lambda = this.lambdas.get(name)!;
            const lambdaArgs: LambdaResolverArgs<T> = {
                args,
                ctx
            }

            try {
                return await lambda(lambdaArgs);
            } catch (error) {
                console.log('Lambda Error: ' + error.message);
                throw error;
            }
        } else {
            throw new Error(`Lambda ${name} does not exist.`);
        }
    }
}