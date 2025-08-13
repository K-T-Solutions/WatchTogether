package com.watchtogether.apigateway.exception;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;
import java.util.Map;

@ControllerAdvice
public class GraphQlExceptionAdvice {

    @GraphQlExceptionHandler
    public GraphQLError handleGrpcStatusRuntimeException(StatusRuntimeException ex,
                                                         DataFetchingEnvironment env) {
        Status status = ex.getStatus();
        ErrorType errorType = mapGrpcStatusToErrorType(status.getCode());
        String message = (status.getDescription() != null && !status.getDescription().isBlank())
                ? status.getDescription()
                : status.getCode().name();

        return GraphqlErrorBuilder.newError()
                .message(message)
                .extensions(Map.of("classification", errorType.name()))
                .build();
    }

    @GraphQlExceptionHandler
    public GraphQLError handleIllegalArgument(IllegalArgumentException ex,
                                              DataFetchingEnvironment env) {
        return GraphqlErrorBuilder.newError()
                .message(ex.getMessage())
                .extensions(Map.of("classification", ErrorType.BAD_REQUEST.name()))
                .build();
    }

    @GraphQlExceptionHandler
    public GraphQLError handleGeneric(Exception ex, DataFetchingEnvironment env) {
        return GraphqlErrorBuilder.newError()
                .message("Internal server error")
                .extensions(Map.of("classification", ErrorType.INTERNAL_ERROR.name()))
                .build();
    }

    private ErrorType mapGrpcStatusToErrorType(Status.Code code) { //TODO: refactor
        return switch (code) {
            case INVALID_ARGUMENT, FAILED_PRECONDITION, OUT_OF_RANGE, ALREADY_EXISTS, ABORTED, RESOURCE_EXHAUSTED,
                 UNIMPLEMENTED -> ErrorType.BAD_REQUEST;
            case NOT_FOUND -> ErrorType.NOT_FOUND;
            case PERMISSION_DENIED -> ErrorType.FORBIDDEN;
            case UNAUTHENTICATED -> ErrorType.UNAUTHORIZED;
            case UNAVAILABLE, DEADLINE_EXCEEDED, INTERNAL, DATA_LOSS, UNKNOWN, CANCELLED -> ErrorType.INTERNAL_ERROR;
            case OK -> null;
        };
    }
}


