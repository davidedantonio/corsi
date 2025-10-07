import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Introduzione ai Database",
    Svg: "/img/database_main.png",
    description: (
      <>
        I database sono strumenti essenziali pensati per archiviare, organizzare
        e gestire dati così da ottenere rapidamente informazioni e supportare
        applicazioni moderne.
      </>
    ),
  },
  {
    title: "Data Analytics & Business Intelligence",
    Svg: "/img/analytics_main.png",
    description: (
      <>
        Data analytics e business intelligence sono discipline che raccolgono,
        analizzano e visualizzano informazioni per generare insight strategici e
        guidare decisioni aziendali efficaci.
      </>
    ),
  },
  {
    title: "Data Analytics & Artificial Intelligence",
    Svg: "/img/ai_main.png",
    description: (
      <>
        Data analytics e intelligenza artificiale uniscono analisi avanzate e
        modelli intelligenti per creare agenti autonomi e sistemi MCP capaci di
        sfruttare i dati in modo innovativo.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <img src={Svg} className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
