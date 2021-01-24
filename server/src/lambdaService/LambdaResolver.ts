export type LambdaResolverArgs<T> = {
    args: T,
    ctx?: any,
}

export type LambdaResolver<T> = (args: LambdaResolverArgs<T>) => Promise<any>;