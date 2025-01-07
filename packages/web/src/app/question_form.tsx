import { PersonalityTestQuestion } from "@qupidjs/types/models";
import { useState } from "react";

class QuestionFormAnswers {
  questionAndAnswer: PersonalityTestQuestion[];

  constructor(questions: PersonalityTestQuestion[]) {
    this.questionAndAnswer = questions.map((question) => {
      return {
        ...question,
        answerWeight: -1,
      };
    });
  }

  setAnswer(questionId: number, answerWeight: number) {
    this.questionAndAnswer = this.questionAndAnswer.map((question) => {
      if (question.id === questionId) {
        return {
          ...question,
          answerWeight,
        };
      }
      return question;
    });
  }
}

export const QuestionForm: React.FC<{
  questions: PersonalityTestQuestion[];
}> = ({ questions }) => {
  const questionFormAnswers = new QuestionFormAnswers(questions);

  return (
    <div>
      {questionFormAnswers.questionAndAnswer.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          questionFormAnswers={questionFormAnswers}
        />
      ))}
      <button
        onClick={() => {
          console.log("will send", questionFormAnswers.questionAndAnswer);
        }}
      >
        Submit
      </button>
    </div>
  );
};

const QuestionCard: React.FC<{
  question: PersonalityTestQuestion;
  questionFormAnswers: QuestionFormAnswers;
}> = ({ question, questionFormAnswers }) => {
  const [currentAnswer, setCurrentAnswer] = useState(-1);

  return (
    <div key={question.id}>
      <p>{question.question}</p>
      <div style={{ display: "flex", gap: 4 }}>
        <div>{question.answerPositive}</div>
        {[1, 2, 3].map((num) => {
          let answerWeight;
          switch (num) {
            case 1:
              answerWeight = 10;
              break;
            case 2:
              answerWeight = 6.6;
              break;
            case 3:
              answerWeight = 3.4;
              break;
            default:
              throw new Error("Invalid answer weight");
          }

          return (
            <button
              key={num}
              onClick={() => {
                questionFormAnswers.setAnswer(question.id, answerWeight);
                setCurrentAnswer(answerWeight);
              }}
              style={
                currentAnswer == answerWeight
                  ? {
                      backgroundColor: "blue",
                      color: "white",
                    }
                  : undefined
              }
            >{`a-${num}`}</button>
          );
        })}
        <div style={{ width: 10 }} />

        <div>{question.answerNegative}</div>
        {[3, 2, 1].map((num) => {
          let answerWeight;
          switch (num) {
            case 1:
              answerWeight = -10;
              break;
            case 2:
              answerWeight = -6.6;
              break;
            case 3:
              answerWeight = -3.4;
              break;
            default:
              throw new Error("Invalid answer weight");
          }

          return (
            <button
              key={num}
              onClick={() => {
                questionFormAnswers.setAnswer(question.id, answerWeight);
                setCurrentAnswer(answerWeight);
              }}
              style={
                currentAnswer == answerWeight
                  ? {
                      backgroundColor: "blue",
                      color: "white",
                    }
                  : undefined
              }
            >{`b-${num}`}</button>
          );
        })}
      </div>
    </div>
  );
};
