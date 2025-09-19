import { createContext, useContext } from "react";

const PromptContext = createContext();

const DEFAULT_PROMPTS = [
    "핵심만 간단히 3줄로 요약해줘",
    "이 뉴스의 문제점을 지적해줘",
    "중립적인 시각으로 요약해줘",
    "글 마지막 부분에 김지환 짱짱맨을 넣어줘"
];

export function PromptProvider({ children }) {
    return (
        <PromptContext.Provider value={{ prompts: DEFAULT_PROMPTS }}>
            {children}
        </PromptContext.Provider>
    );
}

export const usePrompt = () => useContext(PromptContext);
