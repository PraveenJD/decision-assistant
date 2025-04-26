import { ChangeEvent, useEffect, useState } from "react";

import { Button, TextField } from "@mui/material";

import axios from "axios";
import { Expert } from "../../../../hooks/HomePageContext/HomePageProvider";
import { useHomePageContext } from "../../../../hooks/HomePageContext";
import Loader from "../../../../components/Loader";

type QuestionAndAnswer = { question: string; answer: string };

const ChatTab = () => {
  const { homePageData, setHomePageData } = useHomePageContext();
  const { loadingMessage, suggestedQuestion } = homePageData || {};

  const [questionVal, setQuestionVal] = useState("");
  const [finalAnswer, setFinalAnswer] = useState("");
  const [token, setToken] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InByYXZlZW4ua3VtYXJAZ3JhbWVuZXIuY29tIn0.x396P1tXJBjZaji4y4SFwsWdbiHfcpzNXOfKM64k4qs"
  );

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get(
          "https://llmfoundry.straive.com/token",
          {
            withCredentials: true,
          }
        );
        // console.log(response.data);

        // if (!token) {
        //   window.location.href = `https://llmfoundry.straive.com?redirect=${window.location.href}`;
        // } else {
        //   setToken(token);
        // }
      } catch (error: any) {
        throw new Error(error.message);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (suggestedQuestion) handleSubmit();
  }, [suggestedQuestion]);

  const callOpenAI = async (systemPrompt: string, userMessage: string) => {
    try {
      const res = await axios.post(
        "https://llmfoundry.straive.com/openai/v1/chat/completions",
        {
          model: "gpt-4.1-nano",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;
      if (data.error) throw new Error(data.error.message);

      return data.choices?.[0]?.message?.content || "No response";
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  };

  const getExperts = async (q: string) => {
    setHomePageData?.((prevVal) => ({
      ...prevVal,
      loadingMessage: "Identifying expert panel...",
    }));
    const systemPrompt = `
    You are an assistant tasked with identifying 3 experts for a roundtable discussion
    on a specific question. For the given question, suggest 3 distinct experts who would
    have valuable perspectives on the topic. Each expert should have different specialties
    and backgrounds to ensure diverse insights.

    Provide your response in JSON format with the following structure:
    {
      "experts": [
        {
          "title": "Expert's title/profession",
          "specialty": "Expert's area of expertise",
          "background": "Brief 1-2 sentence background on why this expert is relevant and what they bring to the table with respect to the question"
        },
        {...},
        {...}
      ]
    }
  `;

    const result = await callOpenAI(systemPrompt, q);
    return JSON.parse(result).experts;
  };

  const generateExpertQuestions = async (question: string, expert: Expert) => {
    const systemPrompt = `
    You are an assistant tasked with generating 3 insightful questions related to the user's
    main question. These questions should be specialized for ${expert.name}, a ${expert.title}
    with expertise in ${expert.specialty}.

    Generate questions that leverage this expert's unique perspective and knowledge. Each
    question should help address different aspects of the main question.

    Provide your response in JSON format:
    {
      "questions": [
        "First specialized question for the expert",
        "Second specialized question for the expert",
        "Third specialized question for the expert"
      ]
    }
  `;

    const result = await callOpenAI(systemPrompt, question);
    return JSON.parse(result).questions;
  };

  const getExpertAnswers = async (
    q: string,
    expert: any,
    questions: string[]
  ) => {
    const systemPrompt = `
    You are ${expert.name}, a ${expert.title} with expertise in ${expert.specialty}.
    ${expert.background}

    Please provide your expert answers to the following questions based on your
    specialized knowledge and perspective. Be insightful and specific, drawing
    on your expertise.

    Format your response as JSON:
    {
      "answers": [
        "Answer to first question",
        "Answer to second question",
        "Answer to third question"
      ]
    }
  `;
    const userMessage = `
      Main topic: ${q}
      Questions:
      1. ${questions[0]}
      2. ${questions[1]}
      3. ${questions[2]}
    `;

    const result = await callOpenAI(systemPrompt, userMessage);
    const sanitizedResult = result.replace(/,(\s*])/, "$1");

    return JSON.parse(sanitizedResult).answers;
  };

  const generateExpertSummary = async (
    q: string,
    expert: any,
    qas: { question: string; answer: string }[]
  ) => {
    const systemPrompt = `
    You are an assistant tasked with summarizing the insights provided by ${expert.name},
    a ${expert.title} with expertise in ${expert.specialty}.

    Review the expert's answers to the specialized questions and create a concise summary
    of their key points and contributions to addressing the main question.

    The summary should be 2-3 paragraphs and highlight the unique perspective this expert brings.
  `;
    const userMessage = `
      Main question: ${q}
      Expert: ${expert.name}, ${expert.title}
      Q&A: ${qas.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join("\n\n")}
    `;

    return await callOpenAI(systemPrompt, userMessage);
  };

  const generateFinalAnswer = async (q: string, data: Expert[]) => {
    setHomePageData?.((prevVal) => ({
      ...prevVal,
      loadingMessage: "Synthesizing final answer...",
    }));
    const systemPrompt = `
    You are an assistant tasked with synthesizing insights from multiple experts to provide
    a comprehensive answer to the user's original question.

    Review the summaries from each expert and create a well-structured final answer that:
    1. Integrates the key insights from all experts
    2. Highlights areas of consensus and different perspectives
    3. Directly addresses the original question with depth and nuance
    4. Provides a balanced, holistic response

    Your answer should be 3-5 paragraphs and should feel like a conclusion to a thoughtful
    roundtable discussion among experts.
  `;
    const userMessage = `Original question: ${q}\n\n${data
      .map((e) => `Expert: ${e.name}, ${e.title}\nSummary: ${e.summary}`)
      .join("\n\n")}`;

    return await callOpenAI(systemPrompt, userMessage);
  };

  const generateExpertMindmapWithLLM = async (
    question: string,
    expert: any,
    questionsAndAnswers: QuestionAndAnswer[],
    finalAnswer: string
  ) => {
    const systemPrompt = `
You are an assistant tasked with visualizing an expert's reasoning process as a mind map.

Given:
- The main question: "${question}"
- The expert's background: "${expert.background}"
- The expert's specialized questions and answers:
${questionsAndAnswers
  .map(
    (qa, idx) => `  Q${idx + 1}: ${qa.question}\n  A${idx + 1}: ${qa.answer}`
  )
  .join("\n")}
- The final answer synthesized from all experts: "${finalAnswer}"

Create a Mermaid Mindmap (inside a \`\`\`mermaid code block) that best represents this expert's thinking, their contributions, and their relationship to the final answer. Use your judgment to structure the mindmap for clarity and insight. Only output the Mermaid code block.`;
    const result = await callOpenAI(systemPrompt, "");
    const match = result.match(/```mermaid\s*([\s\S]*?)```/);
    return match ? match[1].trim() : "";
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const userQuestion = suggestedQuestion || questionVal;

    setHomePageData?.((prevVal) => ({
      ...prevVal,
      loadingMessage: "Processing your question...",
      experts: [],
    }));
    try {
      const exps = await getExperts(userQuestion);
      const expertsData: Expert[] = [];
      for (const [i, expert] of exps.entries()) {
        expert.name = expert.name || `Expert ${i + 1}`;
        const questions = await generateExpertQuestions(userQuestion, expert);
        const answers = await getExpertAnswers(userQuestion, expert, questions);
        const qas = questions.map((q, idx) => ({
          question: q,
          answer: answers[idx],
        }));

        const summary = await generateExpertSummary(userQuestion, expert, qas);

        expertsData.push({
          ...expert,
          questions,
          answers,
          summary,
          questionsAndAnswers: qas,
          mermaid: "",
        });
      }
      const finalAns = await generateFinalAnswer(userQuestion, expertsData);
      for (const expert of expertsData) {
        expert.mermaid = await generateExpertMindmapWithLLM(
          userQuestion,
          expert,
          expert.questionsAndAnswers,
          finalAns
        );
      }
      setHomePageData?.((prevVal) => ({
        ...prevVal,
        loadingMessage: "",
        suggestedQuestion: "",
        experts: expertsData,
        chat: [
          ...(homePageData?.chat || []),
          { isUser: true, message: userQuestion },
          { isUser: false, message: finalAns },
        ],
      }));
      setFinalAnswer(finalAns);

      setQuestionVal("");
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const onQuestion = (event: ChangeEvent<HTMLInputElement>) =>
    setQuestionVal(event?.target?.value);

  return (
    <>
      <div className="flex-1 flex flex-col gap-3 overflow-auto bg-gray-100 rounded p-3">
        <div className="flex-1 bg-white border border-gray-200 overflow-auto rounded p-2">
          {homePageData?.chat?.map((data, index) => (
            <div
              className={`flex mb-5 ${data.isUser ? "justify-end" : ""}`}
              key={index}
            >
              <p
                className={`p-2 rounded-xl w-3/4 flex whitespace-pre-line ${
                  data.isUser ? "bg-blue-200" : "bg-gray-200"
                }`}
              >
                {data.message}
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex bg-white border border-gray-200">
            <TextField
              placeholder="Ask a question..."
              variant="outlined"
              fullWidth
              onChange={onQuestion}
              value={questionVal}
            />
            <Button
              style={{
                textTransform: "none",
                fontSize: 16,
                fontWeight: 600,
                fontFamily: `"Poppins", sans-serif`,
              }}
              className="w-40"
              variant="contained"
              type="submit"
            >
              Send
            </Button>
          </div>
        </form>
      </div>
      {loadingMessage ? <Loader loaderMessage={loadingMessage} /> : null}
    </>
  );
};

export default ChatTab;
