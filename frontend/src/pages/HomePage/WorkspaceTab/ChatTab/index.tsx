import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

import { Button, TextField } from "@mui/material";

import axios from "axios";
import { Expert } from "../../../../hooks/HomePageContext/HomePageProvider";
import { useHomePageContext } from "../../../../hooks/HomePageContext";
import Loader from "../../../../components/Loader";

type QuestionAndAnswer = { question: string; answer: string };

type ConversationHistory = {
  role: "user" | "assistant";
  content: string;
};

const ChatTab = () => {
  const { homePageData, setHomePageData } = useHomePageContext();
  const {
    loadingMessage,
    suggestedQuestion,
    extractedFilesData,
    hasExtractedFiles,
    chat = [],
  } = homePageData || {};
  const {
    csv = [],
    docx = [],
    excel = [],
    pdfs = [],
  } = extractedFilesData || {};

  console.log(homePageData);

  const endRef = useRef<HTMLDivElement | null>(null);

  const [questionVal, setQuestionVal] = useState("");
  const [finalAnswer, setFinalAnswer] = useState("");
  const [token, setToken] = useState("");
  const [conversationHistory, setConversationHistory] = useState<
    ConversationHistory[]
  >([]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get(
          "https://llmfoundry.straive.com/token",
          {
            withCredentials: true,
          }
        );
        const token = response.data?.token;

        if (!token) {
          window.location.href = `https://llmfoundry.straive.com?redirect=${window.location.href}`;
        } else {
          setToken(token);
        }
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

  const addToHistory = (message: string, isUser = true) => {
    setConversationHistory((prevVal) => [
      ...prevVal,
      {
        role: isUser ? "user" : "assistant",
        content: message,
      },
    ]);
  };

  const getConversationContext = () => {
    return conversationHistory
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n\n");
  };

  const getExperts = async (question: string) => {
    setHomePageData?.((prevVal) => ({
      ...prevVal,
      loadingMessage: "Identifying expert panel...",
    }));
    const systemPrompt = `
    You are an assistant tasked with identifying 3 experts for a roundtable discussion
    on a specific question. These experts should be relevant to analyzing and answering questions about the provided documents.
    
    Consider the full conversation history when selecting experts, as the current question may relate to previous discussion points.
    
    For the given question, conversation history, and document context, suggest 3 distinct experts who would
    have valuable perspectives on the topic. Each expert should have different specialties
    and backgrounds to ensure diverse insights.

    The experts should be able to analyze and interpret:
    - Document content and structure
    - Data patterns and relationships
    - Technical and domain-specific aspects
    - Contextual information
    - Previous conversation points and their relationships

    Provide your response in JSON format with the following structure:
    {
      "experts": [
        {
          "title": "Expert's title/profession",
          "specialty": "Expert's area of expertise",
          "background": "Brief 1-2 sentence background on why this expert is relevant and what they bring to the table with respect to the question, documents, and conversation history"
        },
        {...},
        {...}
      ]
    }
  `;

    const conversationContext = getConversationContext();
    const userMessage = `
    Question: ${question}

    Previous Conversation:
    ${conversationContext}

    Available document content:
    ${pdfs
      .map((pdf) => `PDF: ${pdf.filename}\nContent: ${pdf.content}`)
      .join("\n\n")}
    ${excel
      .map(
        (excel) =>
          `Excel: ${excel.filename}\nContent: ${JSON.stringify(excel.content)}`
      )
      .join("\n\n")}
    ${csv
      .map(
        (csv) => `CSV: ${csv.filename}\nContent: ${JSON.stringify(csv.content)}`
      )
      .join("\n\n")}
    ${docx
      .map((docx) => `DOCX: ${docx.filename}\nContent: ${docx.content}`)
      .join("\n\n")}
  `;

    console.log(userMessage);

    const result = await callOpenAI(systemPrompt, question);
    return JSON.parse(result).experts;
  };

  const generateExpertQuestions = async (question: string, expert: Expert) => {
    const systemPrompt = `
    You are an assistant tasked with generating 3 insightful questions related to the user's
    main question. These questions should be specialized for ${expert.title}
    with expertise in ${expert.specialty}.

    Generate questions that:
    1. Leverage this expert's unique perspective and knowledge
    2. Focus on analyzing and interpreting the provided document content
    3. Help extract meaningful insights from the available data
    4. Address specific aspects of the user's question in relation to the documents

    Your questions should be clear, specific, and directly related to the content of the uploaded documents.
  `;

    const documentContext = `
    Available document content:
    ${pdfs
      .map((pdf) => `PDF: ${pdf.filename}\nContent: ${pdf.content}`)
      .join("\n\n")}
    ${excel
      .map(
        (excel) =>
          `Excel: ${excel.filename}\nContent: ${JSON.stringify(excel.content)}`
      )
      .join("\n\n")}
    ${csv
      .map(
        (csv) => `CSV: ${csv.filename}\nContent: ${JSON.stringify(csv.content)}`
      )
      .join("\n\n")}
    ${docx
      .map((docx) => `DOCX: ${docx.filename}\nContent: ${docx.content}`)
      .join("\n\n")}
  `;

    try {
      const response = await callOpenAI(
        systemPrompt,
        `Question: ${question}\n\nDocument Context:\n${documentContext}\n\nExpert Background: ${expert.background}`
      );
      return response.split("\n").filter((q: string) => q.trim());
    } catch (error: any) {
      throw new Error(
        `Failed to generate questions for ${expert.title}: ${error.message}`
      );
    }
  };

  const getExpertAnswers = async (
    question: string,
    expert: any,
    expertQuestions: string[]
  ) => {
    const systemPrompt = `
    You are ${expert.title}, an expert in ${expert.specialty}. 
    ${expert.background}

    Answer the following questions based on your expertise and the provided document content.
    Your answers should:
    1. Be directly based on the content from the uploaded documents
    2. Reference specific data points or sections from the documents
    3. Provide clear, factual responses supported by the available information
    4. Stay focused on your area of expertise while analyzing the document content
  `;

    const documentContext = `
    Available document content:
    ${pdfs
      .map((pdf) => `PDF: ${pdf.filename}\nContent: ${pdf.content}`)
      .join("\n\n")}
    ${excel
      .map(
        (excel) =>
          `Excel: ${excel.filename}\nContent: ${JSON.stringify(excel.content)}`
      )
      .join("\n\n")}
    ${csv
      .map(
        (csv) => `CSV: ${csv.filename}\nContent: ${JSON.stringify(csv.content)}`
      )
      .join("\n\n")}
    ${docx
      .map((docx) => `DOCX: ${docx.filename}\nContent: ${docx.content}`)
      .join("\n\n")}
  `;

    try {
      const response = await callOpenAI(
        systemPrompt,
        `Main Question: ${question}\n\nDocument Context:\n${documentContext}\n\nQuestions to Answer:\n${expertQuestions.join(
          "\n"
        )}`
      );
      return response.split("\n").filter((a: string) => a.trim());
    } catch (error: any) {
      throw new Error(
        `Failed to get answers from ${expert.title}: ${error.message}`
      );
    }
  };

  const generateExpertSummary = async (
    question: string,
    expert: any,
    questionsAndAnswers: { question: string; answer: string }[]
  ) => {
    const systemPrompt = `
    You are an assistant tasked with summarizing the insights provided by ${expert.name},
    a ${expert.title} with expertise in ${expert.specialty}.

    Review the expert's answers to the specialized questions and create a concise summary
    of their key points and contributions to addressing the main question.

    The summary should be 2-3 paragraphs and highlight the unique perspective this expert brings.
  `;

    const userMessage = `
    Main question: ${question}

    Expert: ${expert.name}, ${expert.title}
    Specialty: ${expert.specialty}
    Background: ${expert.background}

    Q&A:
    ${questionsAndAnswers
      .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
      .join("\n\n")}
  `;

    try {
      return await callOpenAI(systemPrompt, userMessage);
    } catch (error: any) {
      throw new Error(
        `Failed to generate summary for ${expert.name}: ${error.message}`
      );
    }
  };

  const extractMermaidCode = (response: any) => {
    try {
      const mermaidMatch = response.match(/```mermaid\s*([\s\S]*?)```/i);
      if (!mermaidMatch || !mermaidMatch[1]) {
        console.warn("No mermaid code block found in response");
        return null;
      }
      const code = mermaidMatch[1].trim();
      if (!code.startsWith("mindmap")) {
        console.warn("Invalid mindmap code - does not start with mindmap");
        return null;
      }
      return code;
    } catch (error) {
      console.error("Error extracting mermaid code:", error);
      return null;
    }
  };

  const generateFinalAnswer = async (
    question: string,
    expertsData: Expert[]
  ) => {
    setHomePageData?.((prevVal) => ({
      ...prevVal,
      loadingMessage: "Synthesizing final answer...",
    }));
    const systemPrompt = `
    You are an assistant tasked with synthesizing expert insights into a comprehensive answer.
    Consider the full conversation history when formulating your response, as the current question
    may relate to or build upon previous exchanges.
    
    Your response should:
    1. Address the current question directly
    2. Reference relevant points from previous conversation
    3. Integrate expert insights and document evidence
    4. Maintain consistency with previous answers
    5. Clarify any relationships with previous topics discussed
  `;

    const conversationContext = getConversationContext();
    const userMessage = `
    Current Question: ${question}

    Previous Conversation:
    ${conversationContext}

    Expert Insights:
    ${expertsData
      .map(
        (expert) => `
        Expert: ${expert.title} (${expert.specialty})
        Background: ${expert.background}
        Key Questions and Answers:
        ${expert.questionsAndAnswers
          .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
          .join("\n")}
        Summary: ${expert.summary}
      `
      )
      .join("\n\n")}

    Document Context:
    ${pdfs
      .map((pdf) => `PDF: ${pdf.filename}\nContent: ${pdf.content}`)
      .join("\n\n")}
    ${excel
      .map(
        (excel) =>
          `Excel: ${excel.filename}\nContent: ${JSON.stringify(excel.content)}`
      )
      .join("\n\n")}
    ${csv
      .map(
        (csv) => `CSV: ${csv.filename}\nContent: ${JSON.stringify(csv.content)}`
      )
      .join("\n\n")}
    ${docx
      .map((docx) => `DOCX: ${docx.filename}\nContent: ${docx.content}`)
      .join("\n\n")}
  `;

    try {
      return await callOpenAI(systemPrompt, userMessage);
    } catch (error: any) {
      throw new Error(`Failed to generate final answer: ${error.message}`);
    }
  };

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!questionVal && !suggestedQuestion) return;

    const question = suggestedQuestion || questionVal;
    setQuestionVal("");
    addToHistory(question, true);
    setHomePageData?.((prev) => ({
      ...prev,
      loadingMessage: "Processing question...",
      chat: [...(prev.chat || []), { message: question, isUser: true }],
    }));

    try {
      const experts = await getExperts(question);

      const enrichedExperts: Expert[] = [];
      for (const expert of experts) {
        const expertQuestions = await generateExpertQuestions(question, expert);
        const expertAnswers = await getExpertAnswers(
          question,
          expert,
          expertQuestions
        );

        const qa: QuestionAndAnswer[] = expertQuestions.map(
          (questionVal: string, index: number) => ({
            question: questionVal,
            answer: expertAnswers[index] || "No answer",
          })
        );

        const summary = await generateExpertSummary(question, expert, qa);

        const mindmap = await generateExpertMindmapWithLLM(
          question,
          expert,
          qa,
          finalAnswer
        );

        enrichedExperts.push({
          ...expert,
          questionsAndAnswers: qa,
          summary,
          mindmap,
        });
      }

      const final = await generateFinalAnswer(question, enrichedExperts);
      setFinalAnswer(final);
      addToHistory(final, false);

      const insightQuestions = await generateFollowUpQuestions(
        questionVal,
        final
      );

      setHomePageData?.((prev) => ({
        ...prev,
        loadingMessage: "",
        insightQuestions,
        chat: [...(prev.chat || []), { message: final, isUser: false }],
        suggestedQuestion: "",
        experts: enrichedExperts,
      }));
    } catch (error: any) {
      console.error("Error during question processing:", error);
      setHomePageData?.((prev) => ({
        ...prev,
        loadingMessage: "Error occurred. Try again.",
      }));
    }
  };

  const generateExpertMindmapWithLLM = async (
    question: string,
    expert: any,
    questionsAndAnswers: QuestionAndAnswer[],
    finalAnswer: string
  ) => {
    const systemPrompt = `
You are an assistant tasked with creating a Mermaid mindmap visualization. You must follow these rules exactly:

1. Start with \`\`\`mermaid followed by a newline
2. The next line must be exactly: mindmap
3. Use only ASCII characters (no Unicode or special characters)
4. Use proper indentation with spaces (2 spaces per level)
5. Root node must use (( )) notation
6. Follow this exact structure:

\`\`\`mermaid
mindmap
  root((Main Topic))
    Topic1
      Subtopic1
      Subtopic2
    Topic2
      Subtopic3
      Subtopic4
\`\`\`

Create a mindmap that shows this expert's analysis process, key findings, and relationship to the final answer.
ONLY output the mermaid code block, nothing else.`;

    const userMessage = `
Expert: ${expert.title} (${expert.specialty})
Background: ${expert.background}

Question Asked: ${question}

Expert's Q&A Process:
${questionsAndAnswers
  .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
  .join("\n\n")}

Expert's Summary: ${expert.summary}

Final Answer: ${finalAnswer}

Remember:
1. Use the expert's title as the root node
2. Branch out into their key findings
3. Show how their analysis connects to the final answer
4. Keep text concise and clear
5. Use only ASCII characters`;

    try {
      const response = await callOpenAI(systemPrompt, userMessage);
      return extractMermaidCode(response);
    } catch (error) {
      console.error(`Failed to generate mindmap for ${expert.title}:`, error);
      return null;
    }
  };

  const generateFollowUpQuestions = async (
    question: string,
    finalAnswer: string
  ) => {
    const systemPrompt = `
      You are an assistant tasked with generating 3 relevant follow-up questions based on the current conversation.
      The questions should:
      1. Build upon the current discussion
      2. Explore interesting angles not yet covered
      3. Dive deeper into specific aspects mentioned
      4. Be clear and concise
      5. Be diverse in their focus
  
      Return exactly 3 questions in JSON format:
      {
        "questions": [
          {
            "text": "Question text here",
            "context": "Brief explanation of why this is a relevant follow-up"
          },
          {...},
          {...}
        ]
      }
    `;

    const conversationContext = getConversationContext();
    const userMessage = `
      Current Question: ${question}
      Final Answer: ${finalAnswer}
  
      Previous Conversation:
      ${conversationContext}
    `;

    try {
      const response = await callOpenAI(systemPrompt, userMessage);

      return JSON.parse(response).questions;
    } catch (error) {
      console.error("Failed to generate follow-up questions:", error);
      return [];
    }
  };

  const onQuestion = (event: ChangeEvent<HTMLInputElement>) =>
    setQuestionVal(event?.target?.value);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <>
      <div className="flex-1 flex flex-col gap-3 overflow-auto bg-gray-100 rounded p-3">
        <div className="flex-1 bg-white border border-gray-200 overflow-auto rounded p-2">
          {chat?.map((data, index) => (
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
          <div ref={endRef} />
          {/* dummy div ensures scrolling to bottom */}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex bg-white border border-gray-200">
            <TextField
              placeholder="Ask a question..."
              variant="outlined"
              fullWidth
              onChange={onQuestion}
              value={questionVal}
              disabled={!hasExtractedFiles}
              required
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
              disabled={!hasExtractedFiles}
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
