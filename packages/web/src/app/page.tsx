"use client";

import { useEffect } from "react";
// import { PersonalityTestResponseClient } from '@web/httpclient/personality_test_response';

export default function Home() {
  // const client = new PersonalityTestResponseClient();

  useEffect(() => {
    console.log("window.app", window.app);
  });

  return (
    <div>
      <div>ENV: {window.app.config.baseUrl}</div>
    </div>
  );
}
