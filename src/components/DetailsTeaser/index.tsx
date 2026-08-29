import { useScrollReveal } from "../../hooks/useScrollReveal";
import { useLanguage } from "../../context/LanguageContext";
import { useInvitation } from "../../context/InvitationContext";
import { Decor } from "../Decor";
import "./DetailsTeaser.css";

interface DetailsTeaserProps {
  onOpen: () => void;
}

/** The reference's dove paper cut-out, with native text laid over it. */
export function DetailsTeaser({ onOpen }: DetailsTeaserProps) {
  const { t } = useLanguage();
  const { isOpened } = useInvitation();
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section className="details-teaser section" ref={ref}>
      <Decor variant="details" />
      <div className="section__inner">
        <div
          className="details-teaser__paper reveal"
          style={{ ["--i" as string]: 0 }}
        >
          <img
            src={isOpened ? "assets/flower-paper.png" : undefined}
            width={820}
            height={846}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
          />
          <div className="details-teaser__content">
            <h2 className="section-heading details-teaser__title">
              {t("detailsTitle")}
            </h2>
            <button type="button" className="paper-cta" onClick={onOpen}>
              {t("detailsCta")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
