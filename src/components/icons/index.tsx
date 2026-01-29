import { FC } from "react";

import { IconSvgProps } from "@/types/common";

export const GitHubIcon: FC<IconSvgProps> = ({ width = 28, height = 28, ...props }) => (
    <svg
        width={width}
        height={height}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M15.5 6C9.69875 6 5 10.5882 5 16.2529C5 20.7899 8.00562 24.6219 12.1794 25.9804C12.7044 26.0701 12.9012 25.7625 12.9012 25.4934C12.9012 25.2499 12.8881 24.4425 12.8881 23.5838C10.25 24.058 9.5675 22.9558 9.3575 22.3791C9.23937 22.0843 8.7275 21.1743 8.28125 20.9308C7.91375 20.7386 7.38875 20.2644 8.26813 20.2516C9.095 20.2388 9.68563 20.9949 9.8825 21.3025C10.8275 22.8533 12.3369 22.4175 12.9406 22.1484C13.0325 21.4819 13.3081 21.0334 13.61 20.777C11.2737 20.5207 8.8325 19.6364 8.8325 15.7147C8.8325 14.5997 9.23938 13.6769 9.90875 12.9592C9.80375 12.7029 9.43625 11.6519 10.0137 10.2422C10.0137 10.2422 10.8931 9.97301 12.9012 11.2931C13.7412 11.0624 14.6338 10.947 15.5263 10.947C16.4188 10.947 17.3113 11.0624 18.1513 11.2931C20.1594 9.9602 21.0388 10.2422 21.0388 10.2422C21.6163 11.6519 21.2488 12.7029 21.1438 12.9592C21.8131 13.6769 22.22 14.5868 22.22 15.7147C22.22 19.6492 19.7656 20.5207 17.4294 20.777C17.81 21.0975 18.1381 21.7126 18.1381 22.6738C18.1381 24.0452 18.125 25.1474 18.125 25.4934C18.125 25.7625 18.3219 26.0829 18.8469 25.9804C20.9314 25.2935 22.7428 23.9854 24.026 22.2403C25.3092 20.4953 25.9996 18.4012 26 16.2529C26 10.5882 21.3013 6 15.5 6Z"
            fill="currentColor"
        />
    </svg>
);

export const LinkedInIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        width={width}
        height={height}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M4 5.719C4 4.7695 4.789 4 5.7625 4H26.2375C27.211 4 28 4.7695 28 5.719V26.281C28 27.2305 27.211 28 26.2375 28H5.7625C4.789 28 4 27.2305 4 26.281V5.719ZM11.4145 24.091V13.2535H7.813V24.091H11.4145ZM9.6145 11.773C10.87 11.773 11.6515 10.942 11.6515 9.901C11.629 8.8375 10.8715 8.029 9.6385 8.029C8.4055 8.029 7.6 8.839 7.6 9.901C7.6 10.942 8.3815 11.773 9.5905 11.773H9.6145ZM16.9765 24.091V18.0385C16.9765 17.7145 17.0005 17.3905 17.0965 17.1595C17.356 16.513 17.9485 15.8425 18.9445 15.8425C20.248 15.8425 20.7685 16.8355 20.7685 18.2935V24.091H24.37V17.875C24.37 14.545 22.594 12.997 20.224 12.997C18.313 12.997 17.4565 14.047 16.9765 14.7865V14.824H16.9525C16.9605 14.8115 16.9685 14.799 16.9765 14.7865V13.2535H13.3765C13.4215 14.2705 13.3765 24.091 13.3765 24.091H16.9765Z"
            fill="currentColor"
        />
    </svg>
);

export const MailIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        ></path>
    </svg>
);

export const TerminalIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        {...props}
        viewBox="0 0 16 16"
    >
        <path
            fill="currentColor"
            d="M.793 12.293 5.086 8 .793 3.707l1.414-1.414L7.914 8l-5.707 5.707zM7 15h8v-2H7z"
        />
    </svg>
);

export const CheckIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        width={width}
        height={height}
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

export const ZapIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        {...props}
    >
        <path
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m17.763 10.761.107-.163a.128.128 0 0 0-.107-.198H13.5a.214.214 0 0 1-.214-.214V4.213c0-.063-.082-.088-.117-.035l-5.98 9.134-.086.13a.102.102 0 0 0 .086.158h4.314c.117 0 .211.095.211.212v5.79c0 .119.154.163.219.064z"
        />
    </svg>
);

export const GlobeIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
        ></path>
    </svg>
);

export const UserIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        {...props}
    >
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7"
        />
    </svg>
);

export const CodeIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        {...props}
    >
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m7 8-4 3.692L7 16m10-8 4 3.692L17 16M14 4l-4 16"
        />
    </svg>
);

export const LockIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        {...props}
    >
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 10.029C7.471 10 8.053 10 8.8 10h6.4c.747 0 1.329 0 1.8.029m-10 0c-.588.036-1.006.117-1.362.298a3 3 0 0 0-1.311 1.311C4 12.28 4 13.12 4 14.8v1.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C6.28 21 7.12 21 8.8 21h6.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C20 18.72 20 17.88 20 16.2v-1.4c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311c-.356-.181-.774-.262-1.362-.298m-10 0V8a5 5 0 0 1 10 0v2.029"
        />
    </svg>
);

export const LayerIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        {...props}
    >
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m4 8 8-4 8 4-8 4zM4 12l8 4 8-4M4 16l8 4 8-4"
        />
    </svg>
);

export const CPUIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        {...props}
    >
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M9 1.25a.75.75 0 0 1 .75.75v1.263a86 86 0 0 1 1.5-.013V2a.75.75 0 0 1 1.5 0v1.25q.802 0 1.5.013V2a.75.75 0 0 1 1.5 0v1.327q.39.03.739.076c1.172.158 2.121.49 2.87 1.238.748.749 1.08 1.698 1.238 2.87q.046.35.076.739H22a.75.75 0 0 1 0 1.5h-1.263q.013.698.013 1.5H22a.75.75 0 0 1 0 1.5h-1.25q0 .802-.013 1.5H22a.75.75 0 0 1 0 1.5h-1.327q-.03.39-.076.739c-.158 1.172-.49 2.121-1.238 2.87-.749.748-1.698 1.08-2.87 1.238q-.35.046-.739.076V22a.75.75 0 0 1-1.5 0v-1.263q-.698.013-1.5.013V22a.75.75 0 0 1-1.5 0v-1.25q-.802 0-1.5-.013V22a.75.75 0 0 1-1.5 0v-1.327q-.39-.03-.739-.076c-1.172-.158-2.121-.49-2.87-1.238-.748-.749-1.08-1.698-1.238-2.87q-.046-.35-.076-.739H2a.75.75 0 0 1 0-1.5h1.263a86 86 0 0 1-.013-1.5H2a.75.75 0 0 1 0-1.5h1.25q0-.802.013-1.5H2a.75.75 0 0 1 0-1.5h1.327q.03-.39.076-.739c.158-1.172.49-2.121 1.238-2.87.749-.748 1.698-1.08 2.87-1.238q.35-.046.739-.076V2A.75.75 0 0 1 9 1.25M7.71 4.89c-1.005.135-1.585.389-2.008.812S5.025 6.705 4.89 7.71c-.138 1.028-.14 2.382-.14 4.289s.002 3.262.14 4.29c.135 1.005.389 1.585.812 2.008s1.003.677 2.009.812c1.028.138 2.382.14 4.289.14s3.262-.002 4.29-.14c1.005-.135 1.585-.389 2.008-.812s.677-1.003.812-2.009c.138-1.028.14-2.382.14-4.289s-.002-3.261-.14-4.29c-.135-1.005-.389-1.585-.812-2.008s-1.003-.677-2.009-.812c-1.028-.138-2.382-.14-4.289-.14s-3.261.002-4.29.14m2.24 1.36h4.1c.664 0 1.237 0 1.696.062.492.066.963.215 1.345.597s.531.854.597 1.345c.062.459.062 1.032.062 1.697v4.098c0 .665 0 1.238-.062 1.697-.066.492-.215.963-.597 1.345s-.854.531-1.345.597c-.459.062-1.032.062-1.697.062H9.951c-.665 0-1.238 0-1.697-.062-.491-.066-.963-.215-1.345-.597s-.531-.854-.597-1.345c-.062-.459-.062-1.032-.062-1.697V9.951c0-.665 0-1.238.062-1.697.066-.491.215-.963.597-1.345s.854-.531 1.345-.597c.459-.062 1.032-.062 1.697-.062M8.455 7.798c-.325.044-.427.115-.484.172s-.128.159-.172.484c-.046.347-.048.818-.048 1.546v4c0 .728.002 1.2.048 1.546.044.325.115.427.172.484s.159.128.484.172c.347.046.818.048 1.546.048h4c.728 0 1.2-.002 1.546-.048.325-.044.427-.115.484-.172s.128-.159.172-.484c.046-.347.048-.818.048-1.546v-4c0-.728-.002-1.2-.048-1.546-.044-.325-.115-.427-.172-.484s-.159-.128-.484-.172c-.347-.046-.818-.048-1.546-.048h-4c-.728 0-1.2.002-1.546.048"
            clipRule="evenodd"
        />
    </svg>
);

export const RocketIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        {...props}
    >
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M15.75 6v4.582l4.5 4.875V19.5l-5.4-2.25h-.686c.085.471.15 1.132-.022 1.713-.176.594-.654 1.258-1.006 1.706a14 14 0 0 1-.661.777l-.046.05-.013.013-.004.004v.002h-.001l-.576.61-.542-.64-.002-.002-.003-.005-.012-.014-.041-.05a12 12 0 0 1-.59-.784c-.308-.448-.73-1.126-.85-1.735-.11-.56.004-1.185.127-1.645H9.15l-5.4 2.25v-4.043l4.5-4.875V6c0-.644.29-1.199.628-1.63.341-.435.777-.805 1.182-1.099a10 10 0 0 1 1.59-.935l.03-.014.009-.004.003-.002h.002L12 2.177l.307.138h.001l.003.002.01.004.03.014.106.05c.09.045.217.108.368.19.3.162.705.399 1.115.695.405.294.84.664 1.182 1.099.338.431.628.986.628 1.63m-4.26 11.25q-.041.12-.082.257c-.129.438-.19.849-.141 1.098.053.27.3.717.614 1.174l.021.03.056-.069c.36-.458.661-.918.746-1.203.076-.256.053-.667-.03-1.098l-.041-.189zM15.75 16v-3.207l3 3.25v1.207zm-1.5-10v9.75h-4.5V6c0-.184.085-.419.31-.705.22-.283.535-.56.88-.809a9 9 0 0 1 1.06-.65 9 9 0 0 1 1.06.65c.345.25.66.526.88.809.225.286.31.521.31.705m-6 6.793V16l-3 1.25v-1.207z"
            clipRule="evenodd"
        />
    </svg>
);

export const BookIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
    </svg>
);

export const HomeIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

// AI & Agent Related Icons
export const BrainIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
    </svg>
);

export const ChatBubbleIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
    </svg>
);

export const StreamIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
        />
    </svg>
);

export const DatabaseIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
    </svg>
);

export const ServerIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
        />
    </svg>
);

export const ChartIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
    </svg>
);

export const PlannerIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
    </svg>
);

export const SparklesIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
    </svg>
);

export const PlayIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
);

export const ArrowRightIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
    </svg>
);

export const StarIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="currentColor"
        viewBox="0 0 24 24"
        {...props}
    >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

export const CubeIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
    </svg>
);

export const ShieldIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
    </svg>
);

export const ImageIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
    </svg>
);

export const DocumentIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
    </svg>
);

export const GitHubOctocatIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"
        />
    </svg>
);

export const WorkflowIcon: FC<IconSvgProps> = ({ width = 24, height = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4zM10 7h4M7 10v4M17 10v4M10 17h4"
        />
    </svg>
);
