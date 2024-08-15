"use client";

import AltNavbar from "./AltNavbar";

interface Point {
  title: string;
  description: string;
}

interface Section {
  id: string;
  title: string;
  content?: string;
  points?: Point[];
}

interface Policy {
  title: string;
  lastUpdated: string;
  sections: Section[];
}

interface LegalPolicyComponentProps {
  policy: Policy;
}

const LegalPolicyComponent: React.FC<LegalPolicyComponentProps> = ({
  policy,
}) => {
  return (
    <div className="screen-container">
      <div className="w-full h-full flex flex-col items-center p-3 gap-3">
        <AltNavbar />
        <div className="h-full w-full flex flex-col justify-end overflow-y-auto mt-20">
          <div className="overflow-y-auto flex flex-col gap-2">
            <h1 className="text-3xl font-bold mb-4">{policy.title}</h1>
            <p className="text-sm text-gray-400 mb-8">
              Last updated: {policy.lastUpdated}
            </p>

            {policy.sections.map((section) => (
              <section key={section.id} className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
                {section.content ? (
                  <p>{section.content}</p>
                ) : (
                  <ul className="list-disc list-inside">
                    {section.points &&
                      section.points.map((point, index) => (
                        <li key={index}>
                          <strong>{point.title}:</strong> {point.description}
                        </li>
                      ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPolicyComponent;
