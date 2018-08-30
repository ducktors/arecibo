/// <reference types="node" />
import { RequestHandler } from 'fastify';
import { ServerResponse, IncomingMessage } from 'http';
interface IOpts {
    message?: string;
    readinessURL?: string;
    livenessURL?: string;
    readinessCallback?: RequestHandler<IncomingMessage, ServerResponse>;
    livenessCallback?: RequestHandler<IncomingMessage, ServerResponse>;
    [key: string]: any;
}
export default function arecibo(fastify: any, opts: IOpts, next: (err?: Error) => void): void;
export {};
