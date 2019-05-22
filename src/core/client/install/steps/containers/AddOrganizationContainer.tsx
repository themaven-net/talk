import React, { Component } from "react";

import { PropTypesOf } from "coral-ui/types";

import AddOrganization, {
  AddOrganizationForm,
} from "../components/AddOrganization";

interface AddOrganizationContainerProps {
  onGoToNextStep: () => void;
  onGoToPreviousStep: () => void;
  data: PropTypesOf<typeof AddOrganization>["data"];
  onSaveData: (newData: PropTypesOf<typeof AddOrganization>["data"]) => void;
}

class AddOrganizationContainer extends Component<
  AddOrganizationContainerProps
> {
  private onSubmit: AddOrganizationForm["onSubmit"] = async (input, form) => {
    this.props.onSaveData(input);
    return this.props.onGoToNextStep();
  };
  public render() {
    return (
      <AddOrganization
        data={this.props.data}
        onSubmit={this.onSubmit}
        onGoToPreviousStep={this.props.onGoToPreviousStep}
      />
    );
  }
}

export default AddOrganizationContainer;