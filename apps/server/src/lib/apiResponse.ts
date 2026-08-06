import { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

export interface ApiResponse<T = unknown> {
    success: boolean
    message: string
    data?: T | null
    errors?: Array<{field?: string; message: string}> | null
}

export interface SendSuccessParams<T> {
    c: Context
    data: T
    message?: string
    statusCode?: ContentfulStatusCode
}

export interface SendErrorParams<T> {
    c: Context
    message: string
    statusCode?: ContentfulStatusCode
    errors?: Array<{ field?: string; message: string }> | null
}

export function sendSuccess<T>({
    c, 
    data, 
    message = 'Operation Successful', 
    statusCode = 200
}: SendSuccessParams<T>): Response {
   return c.json<ApiResponse<T>>(
    {
        success: true,
        message,
        data,
    },
    statusCode
   ) 
}

export function sendError<T>({
    c,
    message = "An error occurred",
    statusCode = 400,
    errors = null
}: SendErrorParams<T>): Response {
    return c.json<ApiResponse<T>>(
        {
            success: false,
            message,
            data: null,
            errors
        },
        statusCode
    )
}