import clsx from "clsx";
import React from "react";

export const WizardTimeline = ({steps, selectedStep}) => {

    const isSelected = stepNumber => stepNumber <= selectedStep;
    const isPrevious = stepNumber => stepNumber < selectedStep;
    const isFirst = stepNumber => stepNumber === 1;
    const isLast = stepNumber => stepNumber === steps.length;

    return <div className="wizard-timeline-root">
        {steps.map((stepText, i) => {
                const stepNumber = i + 1;
                return <div className="step" key={stepNumber}>
                    <div className="step-symbol">
                        {!isFirst(stepNumber) ?
                            <div className={clsx("step-cord", isSelected(stepNumber) && "selected")}/> : null}
                        <div
                            className={clsx("step-bubble", isSelected(stepNumber) && "selected", isPrevious(stepNumber) && "previous")}>{stepNumber}</div>
                        {!isLast(stepNumber) ?
                            <div className={clsx("step-cord", isSelected(stepNumber + 1) && "selected")}/> : null}
                    </div>
                    <div
                        className={clsx("step-legend", isFirst(stepNumber) && "first", isLast(stepNumber) && "last",
                            isSelected(stepNumber) && "selected", isPrevious(stepNumber) && "previous")}>
                        {stepText}
                    </div>
                </div>
            }
        )}
    </div>
}